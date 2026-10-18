import { useCallback, useEffect, useRef, useState } from 'react'
import { recordFinalScore, type BestScoreResult, type BestScoreStore } from '../../shared/bestScore'
import { Hearts } from '../../shared/Hearts'
import { GameOverOverlay, PausedOverlay } from '../../shared/Overlays'
import { useAnimationFrame } from '../../shared/useAnimationFrame'
import { RaceSession } from '../application/RaceSession'
import { FINISH_DISTANCE, buildCourse } from '../domain/course'
import { MAX_LIVES, RaceGame, type RaceEvent, type SteerDirection } from '../domain/raceGame'
import { Track } from './Track'
import { useRaceControls } from './useRaceControls'
import '../../shared/hud.css'
import '../../shared/controls.css'
import './race.css'

interface RaceScreenProps {
  random: () => number
  bestScores: BestScoreStore
  onExit: () => void
}

const CRASH_MILLISECONDS = 700
const GO_DISTANCE = 25

export function RaceScreen({ random, bestScores, onExit }: RaceScreenProps) {
  const [session] = useState(() => new RaceSession(new RaceGame(buildCourse(random))))
  const [snapshot, setSnapshot] = useState(() => session.snapshot())
  const [result, setResult] = useState<BestScoreResult | null>(null)
  const [crashed, setCrashed] = useState(false)
  const [cookiePop, setCookiePop] = useState(0)
  const crashTimer = useRef<number | undefined>(undefined)
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => () => clearTimeout(crashTimer.current), [])

  const refresh = useCallback(() => setSnapshot(session.snapshot()), [session])

  const react = useCallback(
    (events: RaceEvent[]) => {
      for (const event of events) {
        if (event.type === 'cookieCollected') setCookiePop((pops) => pops + 1)
        if (event.type === 'crashed') {
          clearTimeout(crashTimer.current)
          setCrashed(true)
          crashTimer.current = window.setTimeout(() => setCrashed(false), CRASH_MILLISECONDS)
        }
        if (event.type === 'finished' || event.type === 'gameOver') {
          setResult(recordFinalScore(bestScores, session.snapshot().cookies))
        }
      }
    },
    [bestScores, session],
  )

  useAnimationFrame((elapsed) => {
    react(session.advance(elapsed))
    refresh()
  }, !snapshot.paused && (snapshot.phase === 'countdown' || snapshot.phase === 'racing'))

  const togglePause = useCallback(() => {
    session.togglePause()
    refresh()
  }, [session, refresh])

  useRaceControls({
    hold: (direction) => session.hold(direction),
    release: (direction) => session.release(direction),
    togglePause,
  })

  const dragTo = (event: React.PointerEvent) => {
    if (event.buttons === 0 || !stage.current) return
    const box = stage.current.getBoundingClientRect()
    session.dragTo(((event.clientX - box.left) / box.width) * 100)
  }

  const progress = Math.min(snapshot.distance / FINISH_DISTANCE, 1)
  return (
    <main className="race">
      <div className="race__stage-area">
        <div ref={stage} className="race__stage" onPointerDown={dragTo} onPointerMove={dragTo}>
          <Track snapshot={snapshot} crashed={crashed} cookiePop={cookiePop} />
          {snapshot.phase === 'countdown' && (
            <p key={snapshot.countdown} className="race__call">
              {snapshot.countdown}
            </p>
          )}
          {snapshot.phase === 'racing' && snapshot.distance < GO_DISTANCE && <p className="race__call race__call--go">Go!</p>}
        </div>
      </div>
      <header className="hud">
        <Hearts lives={snapshot.lives} max={MAX_LIVES} />
        <p className="hud__score" role="status">
          Score: {snapshot.cookies}
        </p>
        <button className="hud__pause" onClick={togglePause} aria-label="Pause">
          <span aria-hidden="true">❚❚</span>
        </button>
      </header>
      <div
        className="race__progress"
        role="progressbar"
        aria-label="Race progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <div className="race__progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="race__hint" aria-hidden="true">← → steer</p>
      <TouchControls hold={(direction) => session.hold(direction)} release={(direction) => session.release(direction)} />
      {snapshot.paused && <PausedOverlay onResume={togglePause} onMainMenu={onExit} />}
      {snapshot.phase === 'finished' && result && (
        <GameOverOverlay title="Race finished!" score={snapshot.cookies} result={result} onBackToGames={onExit} />
      )}
      {snapshot.phase === 'over' && result && <GameOverOverlay score={snapshot.cookies} result={result} onBackToGames={onExit} />}
    </main>
  )
}

interface TouchControlsProps {
  hold(direction: SteerDirection): void
  release(direction: SteerDirection): void
}

function TouchControls(props: TouchControlsProps) {
  return (
    <div className="touch-controls">
      <SteerButton direction="left" label="Steer left" arrow="◀" {...props} />
      <SteerButton direction="right" label="Steer right" arrow="▶" {...props} />
    </div>
  )
}

function SteerButton({ direction, label, arrow, hold, release }: TouchControlsProps & { direction: SteerDirection; label: string; arrow: string }) {
  const stop = () => release(direction)
  return (
    <button
      className="direction-button"
      aria-label={label}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        hold(direction)
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onContextMenu={(event) => event.preventDefault()}
    >
      <span aria-hidden="true">{arrow}</span>
    </button>
  )
}
