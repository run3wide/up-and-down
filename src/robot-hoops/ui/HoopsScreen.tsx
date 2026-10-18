import { useCallback, useEffect, useRef, useState } from 'react'
import { recordFinalScore, type BestScoreResult, type BestScoreStore } from '../../shared/bestScore'
import { GameOverOverlay, PausedOverlay } from '../../shared/Overlays'
import { useAnimationFrame } from '../../shared/useAnimationFrame'
import { HoopsSession } from '../application/HoopsSession'
import { HoopsGame, SHOTS_PER_ROUND, type AimDirection, type HoopsEvent, type Random } from '../domain/hoopsGame'
import { Court, type RobotMood } from './Court'
import { useHoopsControls } from './useHoopsControls'
import '../../shared/hud.css'
import '../../shared/controls.css'
import './hoops.css'

interface HoopsScreenProps {
  random: Random
  bestScores: BestScoreStore
  onExit: () => void
}

const REACTION_MILLISECONDS = 900

export function HoopsScreen({ random, bestScores, onExit }: HoopsScreenProps) {
  const [session] = useState(() => new HoopsSession(new HoopsGame(random)))
  const [snapshot, setSnapshot] = useState(() => session.snapshot())
  const [mood, setMood] = useState<RobotMood>('idle')
  const [scoredFlash, setScoredFlash] = useState(false)
  const [result, setResult] = useState<BestScoreResult | null>(null)
  const reaction = useRef<number | undefined>(undefined)

  useEffect(() => () => clearTimeout(reaction.current), [])

  const refresh = useCallback(() => setSnapshot(session.snapshot()), [session])

  const react = useCallback(
    (events: HoopsEvent[]) => {
      for (const event of events) {
        if (event.type === 'scored') showReaction('cheer', true)
        if (event.type === 'missed') showReaction('oops', false)
        if (event.type === 'roundOver') setResult(recordFinalScore(bestScores, session.snapshot().score))
      }

      function showReaction(nextMood: RobotMood, scored: boolean) {
        clearTimeout(reaction.current)
        setMood(nextMood)
        setScoredFlash(scored)
        reaction.current = window.setTimeout(() => {
          setMood('idle')
          setScoredFlash(false)
        }, REACTION_MILLISECONDS)
      }
    },
    [bestScores, session],
  )

  useAnimationFrame((elapsed) => {
    react(session.advance(elapsed))
    refresh()
  }, !snapshot.paused && snapshot.phase !== 'over')

  const shoot = useCallback(() => {
    session.shoot()
    refresh()
  }, [session, refresh])

  const togglePause = useCallback(() => {
    session.togglePause()
    refresh()
  }, [session, refresh])

  useHoopsControls({
    hold: (direction) => session.hold(direction),
    release: (direction) => session.release(direction),
    shoot,
    togglePause,
  })

  return (
    <main className="hoops">
      <div className="hoops__stage-area">
        <div className="hoops__stage">
          <Court
            aim={snapshot.aim}
            shot={snapshot.shot}
            hoopX={snapshot.hoopX}
            mood={mood}
            showAim={snapshot.phase === 'aiming'}
            scoredFlash={scoredFlash}
          />
          {scoredFlash && <p className="hoops__cheer" aria-hidden="true">Swish!</p>}
        </div>
      </div>
      <header className="hud">
        <ShotsLeft count={snapshot.shotsLeft} />
        <p className="hud__score" role="status">
          Score: {snapshot.score}
        </p>
        <button className="hud__pause" onClick={togglePause} aria-label="Pause">
          <span aria-hidden="true">❚❚</span>
        </button>
      </header>
      <p className="hoops__hint" aria-hidden="true">← → aim &nbsp;·&nbsp; Space shoot</p>
      <TouchControls
        hold={(direction) => session.hold(direction)}
        release={(direction) => session.release(direction)}
        shoot={shoot}
      />
      {snapshot.paused && <PausedOverlay onResume={togglePause} />}
      {snapshot.phase === 'over' && result && (
        <GameOverOverlay score={snapshot.score} result={result} onBackToGames={onExit} />
      )}
    </main>
  )
}

function ShotsLeft({ count }: { count: number }) {
  return (
    <div className="hoops__shots" role="img" aria-label={`${count} ${count === 1 ? 'shot' : 'shots'} left`}>
      {Array.from({ length: SHOTS_PER_ROUND }, (_, i) => (
        <span key={i} className={i < count ? 'shot-dot' : 'shot-dot shot-dot--used'} />
      ))}
    </div>
  )
}

interface TouchControlsProps {
  hold(direction: AimDirection): void
  release(direction: AimDirection): void
  shoot(): void
}

function TouchControls({ hold, release, shoot }: TouchControlsProps) {
  return (
    <div className="touch-controls">
      <AimButton direction="left" label="Aim left" arrow="◀" {...{ hold, release }} />
      <button className="direction-button shoot-button" onClick={shoot}>
        Shoot
      </button>
      <AimButton direction="right" label="Aim right" arrow="▶" {...{ hold, release }} />
    </div>
  )
}

function AimButton({ direction, label, arrow, hold, release }: Omit<TouchControlsProps, 'shoot'> & { direction: AimDirection; label: string; arrow: string }) {
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
