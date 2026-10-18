import { useCallback, useEffect, useRef, useState } from 'react'
import { recordFinalScore, type BestScoreResult, type BestScoreStore } from '../../shared/bestScore'
import { GameOverOverlay, PausedOverlay } from '../../shared/Overlays'
import { SoundToggle } from '../../shared/SoundToggle'
import type { SoundPlayer } from '../../shared/sound/SoundPlayer'
import { useAnimationFrame } from '../../shared/useAnimationFrame'
import { VolcanoSession } from '../application/VolcanoSession'
import { VolcanoGame, LEMONS_PER_ROUND, type AimDirection, type VolcanoEvent, type Random } from '../domain/volcanoGame'
import { Court, type StrawberryMood } from './Court'
import { LavaSplats } from './LavaSplats'
import { SPLAT_LIFETIME_MILLISECONDS, lavaSplatsForEruption, type LavaSplat } from './lavaEruption'
import { useVolcanoControls } from './useVolcanoControls'
import '../../shared/hud.css'
import '../../shared/controls.css'
import './volcano.css'

interface VolcanoScreenProps {
  random: Random
  bestScores: BestScoreStore
  sound: SoundPlayer
  onExit: () => void
}

const REACTION_MILLISECONDS = 900
const LAVA_FLOW_MILLISECONDS = 4800

export function VolcanoScreen({ random, bestScores, sound, onExit }: VolcanoScreenProps) {
  const [session] = useState(() => new VolcanoSession(new VolcanoGame(random)))
  const [snapshot, setSnapshot] = useState(() => session.snapshot())
  const [mood, setMood] = useState<StrawberryMood>('idle')
  const [scoredFlash, setScoredFlash] = useState(false)
  const [result, setResult] = useState<BestScoreResult | null>(null)
  const [muted, setMuted] = useState(false)
  const [lavaFlow, setLavaFlow] = useState<number | null>(null)
  const [splats, setSplats] = useState<readonly LavaSplat[]>([])
  const reaction = useRef<number | undefined>(undefined)
  const splatTimers = useRef<number[]>([])
  const eruptions = useRef(0)
  const nextSplatId = useRef(0)

  useEffect(
    () => () => {
      clearTimeout(reaction.current)
      splatTimers.current.forEach(clearTimeout)
    },
    [],
  )

  const refresh = useCallback(() => setSnapshot(session.snapshot()), [session])

  const react = useCallback(
    (events: VolcanoEvent[]) => {
      for (const event of events) {
        if (event.type === 'scored') erupt()
        if (event.type === 'missed') showReaction('oops', false)
        if (event.type === 'roundOver') setResult(recordFinalScore(bestScores, session.snapshot().score))
      }

      function erupt() {
        showReaction('cheer', true)
        if (!muted) sound.play('eruption')
        const eruption = eruptions.current++
        setLavaFlow(eruption)
        splatTimers.current.push(window.setTimeout(() => setLavaFlow((flowing) => (flowing === eruption ? null : flowing)), LAVA_FLOW_MILLISECONDS))
        const fresh = lavaSplatsForEruption(eruption, nextSplatId.current)
        nextSplatId.current += fresh.length
        setSplats((current) => [...current, ...fresh])
        splatTimers.current.push(
          window.setTimeout(() => {
            setSplats((current) => current.filter((splat) => !fresh.includes(splat)))
          }, SPLAT_LIFETIME_MILLISECONDS),
        )
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
    [bestScores, session, sound, muted],
  )

  useAnimationFrame((elapsed) => {
    react(session.advance(elapsed))
    refresh()
  }, !snapshot.paused && snapshot.phase !== 'over')

  const toss = useCallback(() => {
    sound.unlock()
    session.toss()
    refresh()
  }, [session, refresh, sound])

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
            lavaFlow={lavaFlow}
          />
          {scoredFlash && <p className="lemon-volcano__cheer" aria-hidden="true">Splash!</p>}
        </div>
      </div>
      <header className="hud">
        <LemonsLeft count={snapshot.lemonsLeft} />
        <p className="hud__score" role="status">
          Score: {snapshot.score}
        </p>
        <div className="hud__actions">
          <SoundToggle muted={muted} onToggle={() => setMuted(!muted)} />
          <button className="hud__pause" onClick={togglePause} aria-label="Pause">
            <span aria-hidden="true">❚❚</span>
          </button>
        </div>
      </header>
      <LavaSplats splats={splats} />
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
