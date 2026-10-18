import { useCallback, useState } from 'react'
import { recordFinalScore, type BestScoreResult, type BestScoreStore } from '../../shared/bestScore'
import { Hearts } from '../../shared/Hearts'
import { GameOverOverlay, Overlay, PausedOverlay } from '../../shared/Overlays'
import { SoundToggle } from '../../shared/SoundToggle'
import type { SoundPlayer } from '../../shared/sound/SoundPlayer'
import { useAnimationFrame } from '../../shared/useAnimationFrame'
import { MazeSession } from '../application/MazeSession'
import type { Direction, Maze } from '../domain/maze'
import { MAX_LIVES, MazeGame, type MazeEvent } from '../domain/mazeGame'
import { MazeBoard } from './MazeBoard'
import { useMazeControls } from './useMazeControls'
import '../../shared/hud.css'
import './maze.css'

interface MazeScreenProps {
  maze: Maze
  bestScores: BestScoreStore
  sound: SoundPlayer
  /** Seconds on the clock for each try; leave out for the usual. */
  timeLimit?: number
  onExit: () => void
}

const ARROWS: readonly { direction: Direction; label: string; arrow: string }[] = [
  { direction: 'up', label: 'Go up', arrow: '▲' },
  { direction: 'left', label: 'Go left', arrow: '◀' },
  { direction: 'right', label: 'Go right', arrow: '▶' },
  { direction: 'down', label: 'Go down', arrow: '▼' },
]

export function MazeScreen({ maze, bestScores, sound, timeLimit, onExit }: MazeScreenProps) {
  const [session] = useState(() => new MazeSession(new MazeGame(maze, timeLimit)))
  const [snapshot, setSnapshot] = useState(() => session.snapshot())
  const [result, setResult] = useState<BestScoreResult | null>(null)
  const [muted, setMuted] = useState(false)
  const [facing, setFacing] = useState<'left' | 'right'>('right')

  if ((snapshot.heading === 'left' || snapshot.heading === 'right') && snapshot.heading !== facing) setFacing(snapshot.heading)

  const refresh = useCallback(() => setSnapshot(session.snapshot()), [session])

  const react = useCallback(
    (events: MazeEvent[]) => {
      const won = events.some((event) => event.type === 'won')
      const outOfTries = events.some((event) => event.type === 'timeUp' && event.livesLeft === 0)
      if (won || outOfTries) setResult(recordFinalScore(bestScores, session.snapshot().score))
      if (won && !muted) sound.play('roar')
    },
    [bestScores, session, sound, muted],
  )

  useAnimationFrame((elapsed) => {
    react(session.advance(elapsed))
    refresh()
  }, snapshot.phase === 'playing' && !snapshot.paused)

  const step = useCallback(
    (direction: Direction) => {
      sound.unlock()
      react(session.step(direction))
      refresh()
    },
    [session, react, refresh, sound],
  )

  const tryAgain = useCallback(() => {
    session.tryAgain()
    refresh()
  }, [session, refresh])

  const togglePause = useCallback(() => {
    session.togglePause()
    refresh()
  }, [session, refresh])

  useMazeControls({ step, togglePause })

  return (
    <main className="maze">
      <div className="maze__board-area">
        <MazeBoard maze={maze} snapshot={snapshot} facing={facing} />
      </div>
      <header className="hud">
        <Hearts lives={snapshot.lives} max={MAX_LIVES} />
        <div className="maze__scores">
          <p className="hud__score" role="status">
            🍪 left: {snapshot.cookiesLeft}
          </p>
          <p className="hud__score" role="timer">
            ⏱ {Math.ceil(snapshot.secondsLeft)}
          </p>
        </div>
        <div className="hud__actions">
          <SoundToggle muted={muted} onToggle={() => setMuted(!muted)} />
          <button className="hud__pause" onClick={togglePause} aria-label="Pause">
            <span aria-hidden="true">❚❚</span>
          </button>
        </div>
      </header>
      {snapshot.phase === 'ready' && (
        <p className="maze__hint">
          <span className="maze__hint--keys">Press an arrow to step!</span>
          <span className="maze__hint--touch">Tap an arrow to step!</span>
        </p>
      )}
      <div className="maze__arrows">
        {ARROWS.map(({ direction, label, arrow }) => (
          <button key={direction} className={`direction-button maze__arrow maze__arrow--${direction}`} aria-label={label} onClick={() => step(direction)}>
            <span aria-hidden="true">{arrow}</span>
          </button>
        ))}
      </div>
      {snapshot.paused && <PausedOverlay onResume={togglePause} onMainMenu={onExit} />}
      {snapshot.phase === 'timeUp' && (
        <Overlay title="Time's up!">
          <p className="overlay__message">Better luck next time! 🍪</p>
          <button className="big-button" autoFocus onClick={tryAgain}>
            Try again
          </button>
        </Overlay>
      )}
      {snapshot.phase === 'over' && result && (
        <GameOverOverlay title="Time's up!" message="Better luck next time! 🍪" score={snapshot.score} result={result} onBackToGames={onExit} />
      )}
      {snapshot.phase === 'won' && result && (
        <GameOverOverlay title="Every cookie!" score={snapshot.score} result={result} onBackToGames={onExit} />
      )}
    </main>
  )
}
