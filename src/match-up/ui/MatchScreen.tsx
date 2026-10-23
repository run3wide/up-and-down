import { useCallback, useEffect, useState } from 'react'
import { FrameControls } from '../../shared/frame/FrameControls'
import { recordFinalScore, type BestScoreStore } from '../../shared/bestScore'
import { PausedOverlay } from '../../shared/Overlays'
import { PICTURES } from '../domain/pictures'
import { MatchGame, type MatchEvent } from '../domain/matchGame'
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
  const [game] = useState(() => new MatchGame(PICTURES, random))
  const [snapshot, setSnapshot] = useState(() => game.snapshot())
  const [message, setMessage] = useState('')
  const [best, setBest] = useState(() => bestScores.load())
  const [paused, setPaused] = useState(false)

  const react = useCallback(
    (events: MatchEvent[]) => {
      for (const event of events) {
        if (event.type === 'cardFlipped') setMessage('')
        if (event.type === 'pairFound') setMessage(`A match! ${event.face}${event.face} ⭐`)
        if (event.type === 'pairMissed') setMessage(`${event.first} and ${event.second} are not the same. Try again!`)
        if (event.type === 'boardCleared') {
          setMessage('Great job! You found them all! 🎉')
          setBest(recordFinalScore(bestScores, game.snapshot().boardsCleared).best)
        }
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
        <p className="hud__score" role="note">
          Best: {best}
        </p>
        <p className="hud__score" role="status">
          Score: {snapshot.boardsCleared}
        </p>
      </header>
      <FrameControls pause={{ paused, onPause: () => setPaused(true) }} />
      <h1 className="match__title">Find two that are the same</h1>
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
    </main>
  )
}
