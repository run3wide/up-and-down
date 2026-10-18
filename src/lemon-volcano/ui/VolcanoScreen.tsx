import { useCallback, useEffect, useRef, useState } from 'react'
import { recordFinalScore, type BestScoreResult, type BestScoreStore } from '../../shared/bestScore'
import { GameOverOverlay, PausedOverlay } from '../../shared/Overlays'
import { useAnimationFrame } from '../../shared/useAnimationFrame'
import { VolcanoSession } from '../application/VolcanoSession'
import { VolcanoGame, LEMONS_PER_ROUND, type AimDirection, type VolcanoEvent, type Random } from '../domain/volcanoGame'
import { Court, type StrawberryMood } from './Court'
import { useVolcanoControls } from './useVolcanoControls'
import '../../shared/hud.css'
import '../../shared/controls.css'
import './volcano.css'

interface VolcanoScreenProps {
  random: Random
  bestScores: BestScoreStore
  onExit: () => void
}

const REACTION_MILLISECONDS = 900

export function VolcanoScreen({ random, bestScores, onExit }: VolcanoScreenProps) {
  const [session] = useState(() => new VolcanoSession(new VolcanoGame(random)))
  const [snapshot, setSnapshot] = useState(() => session.snapshot())
  const [mood, setMood] = useState<StrawberryMood>('idle')
  const [scoredFlash, setScoredFlash] = useState(false)
  const [result, setResult] = useState<BestScoreResult | null>(null)
  const reaction = useRef<number | undefined>(undefined)

  useEffect(() => () => clearTimeout(reaction.current), [])

  const refresh = useCallback(() => setSnapshot(session.snapshot()), [session])

  const react = useCallback(
    (events: VolcanoEvent[]) => {
      for (const event of events) {
        if (event.type === 'scored') showReaction('cheer', true)
        if (event.type === 'missed') showReaction('oops', false)
        if (event.type === 'roundOver') setResult(recordFinalScore(bestScores, session.snapshot().score))
      }

      function showReaction(nextMood: StrawberryMood, scored: boolean) {
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

  const toss = useCallback(() => {
    session.toss()
    refresh()
  }, [session, refresh])

  const togglePause = useCallback(() => {
    session.togglePause()
    refresh()
  }, [session, refresh])

  useVolcanoControls({
    hold: (direction) => session.hold(direction),
    release: (direction) => session.release(direction),
    toss,
    togglePause,
  })

  return (
    <main className="lemon-volcano">
      <div className="lemon-volcano__stage-area">
        <div className="lemon-volcano__stage">
          <Court
            aim={snapshot.aim}
            lemon={snapshot.lemon}
            craterX={snapshot.craterX}
            mood={mood}
            showAim={snapshot.phase === 'aiming'}
            scoredFlash={scoredFlash}
          />
          {scoredFlash && <p className="lemon-volcano__cheer" aria-hidden="true">Splash!</p>}
        </div>
      </div>
      <header className="hud">
        <LemonsLeft count={snapshot.lemonsLeft} />
        <p className="hud__score" role="status">
          Score: {snapshot.score}
        </p>
        <button className="hud__pause" onClick={togglePause} aria-label="Pause">
          <span aria-hidden="true">❚❚</span>
        </button>
      </header>
      <p className="lemon-volcano__hint" aria-hidden="true">← → aim &nbsp;·&nbsp; Space throw</p>
      <TouchControls
        hold={(direction) => session.hold(direction)}
        release={(direction) => session.release(direction)}
        toss={toss}
      />
      {snapshot.paused && <PausedOverlay onResume={togglePause} onMainMenu={onExit} />}
      {snapshot.phase === 'over' && result && (
        <GameOverOverlay score={snapshot.score} result={result} onBackToGames={onExit} />
      )}
    </main>
  )
}

function LemonsLeft({ count }: { count: number }) {
  return (
    <div className="lemon-volcano__lemons" role="img" aria-label={`${count} ${count === 1 ? 'lemon' : 'lemons'} left`}>
      {Array.from({ length: LEMONS_PER_ROUND }, (_, i) => (
        <span key={i} className={i < count ? 'lemon-dot' : 'lemon-dot lemon-dot--used'} />
      ))}
    </div>
  )
}

interface TouchControlsProps {
  hold(direction: AimDirection): void
  release(direction: AimDirection): void
  toss(): void
}

function TouchControls({ hold, release, toss }: TouchControlsProps) {
  return (
    <div className="touch-controls">
      <AimButton direction="left" label="Aim left" arrow="◀" {...{ hold, release }} />
      <button className="direction-button toss-button" onClick={toss}>
        Throw
      </button>
      <AimButton direction="right" label="Aim right" arrow="▶" {...{ hold, release }} />
    </div>
  )
}

function AimButton({ direction, label, arrow, hold, release }: Omit<TouchControlsProps, 'toss'> & { direction: AimDirection; label: string; arrow: string }) {
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
