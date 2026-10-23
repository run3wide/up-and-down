import { useCallback, useEffect, useState } from 'react'
import { FrameControls } from '../../shared/frame/FrameControls'
import { recordFinalScore, type BestScoreResult, type BestScoreStore } from '../../shared/bestScore'
import { Hearts } from '../../shared/Hearts'
import { GameOverOverlay, PausedOverlay } from '../../shared/Overlays'
import { KINDS } from '../domain/kinds'
import { MAX_LIVES, MatchGame, type MatchEvent } from '../domain/matchGame'
import '../../shared/hud.css'
import './match.css'

/** Long enough to see both cards, short enough not to wait. */
const MISS_SHOWN_MS = 1000

interface MatchScreenProps {
  random: () => number
  bestScores: BestScoreStore
  onExit: () => void
}

export function MatchScreen({ random, bestScores, onExit }: MatchScreenProps) {
  const [game] = useState(() => new MatchGame(KINDS, random))
  const [snapshot, setSnapshot] = useState(() => game.snapshot())
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<BestScoreResult | null>(null)
  const [paused, setPaused] = useState(false)

  const react = useCallback(
    (events: MatchEvent[]) => {
      for (const event of events) {
        if (event.type === 'cardFlipped') setMessage('')
        if (event.type === 'pairFound') setMessage(`Both are ${event.kind}! ⭐`)
        if (event.type === 'pairMissed') setMessage(`${event.first} and ${event.second} are not alike. Try again!`)
        if (event.type === 'boardCleared') setMessage('Great job! You found them all! 🎉')
        if (event.type === 'gameOver') setResult(recordFinalScore(bestScores, game.snapshot().boardsCleared))
      }
    },
    [bestScores, game],
  )

  const missShowing = snapshot.phase === 'playing' && snapshot.cards.filter((card) => card.state === 'up').length === 2

  useEffect(() => {
    if (!missShowing) return
    const timer = setTimeout(() => {
      game.turnBackMissed()
      setSnapshot(game.snapshot())
    }, MISS_SHOWN_MS)
    return () => clearTimeout(timer)
  }, [missShowing, game])

  const flip = (id: number) => {
    react(game.flip(id))
    setSnapshot(game.snapshot())
  }

  const nextBoard = () => {
    game.nextBoard()
    setMessage('')
    setSnapshot(game.snapshot())
  }

  return (
    <main className="match">
      <header className="hud">
        <Hearts lives={snapshot.lives} max={MAX_LIVES} />
        <p className="hud__score" role="status">
          Score: {snapshot.boardsCleared}
        </p>
      </header>
      <FrameControls pause={{ paused, onPause: () => setPaused(true) }} />
      <h1 className="match__title">Find two that are alike</h1>
      <p className="match__message" role="alert">
        {message}
      </p>
      <div className="match__cards" role="group" aria-label="Cards">
        {snapshot.cards.map((card) =>
          card.state === 'down' ? (
            <button
              key={card.id}
              className="match-card match-card--down"
              aria-label={`Hidden card ${card.id + 1}`}
              disabled={paused || snapshot.phase !== 'playing'}
              onClick={() => flip(card.id)}
            >
              <span aria-hidden="true">{card.id + 1}</span>
            </button>
          ) : (
            <button key={card.id} className={`match-card match-card--${card.state}`} aria-label={card.name} disabled>
              <span className="match-card__face" aria-hidden="true">
                {card.face}
              </span>
              <span aria-hidden="true">{card.name}</span>
            </button>
          ),
        )}
      </div>
      {snapshot.phase === 'cleared' && (
        <button className="big-button" autoFocus onClick={nextBoard}>
          Next board
        </button>
      )}
      {paused && <PausedOverlay onResume={() => setPaused(false)} onMainMenu={onExit} />}
      {snapshot.phase === 'over' && result && (
        <GameOverOverlay title="Good try!" score={snapshot.boardsCleared} result={result} onBackToGames={onExit} />
      )}
    </main>
  )
}
