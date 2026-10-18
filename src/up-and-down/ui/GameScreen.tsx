import { useCallback, useEffect, useRef, useState } from 'react'
import type { DinoMood } from '../../art/Dino'
import { recordFinalScore, type BestScoreResult, type BestScoreStore } from '../../shared/bestScore'
import { GameSession } from '../application/GameSession'
import { Game, type Direction, type GameEvent, type Random } from '../domain/game'
import { WORLD_WIDTH } from '../domain/world'
import { Hud } from './Hud'
import { GameOverOverlay, PausedOverlay } from '../../shared/Overlays'
import { Playfield, type Burst } from './Playfield'
import { useAnimationFrame } from '../../shared/useAnimationFrame'
import { useKeyboardControls } from './useKeyboardControls'
import '../../shared/hud.css'
import '../../shared/controls.css'
import './game.css'

interface GameScreenProps {
  random: Random
  bestScores: BestScoreStore
  onExit: () => void
}

const MOOD_SECONDS = 0.6

export function GameScreen({ random, bestScores, onExit }: GameScreenProps) {
  const [session] = useState(() => new GameSession(new Game(random)))
  const [snapshot, setSnapshot] = useState(() => session.snapshot())
  const [mood, setMood] = useState<DinoMood>('idle')
  const [bursts, setBursts] = useState<readonly Burst[]>([])
  const [result, setResult] = useState<BestScoreResult | null>(null)
  const nextBurstId = useRef(0)
  const timers = useRef<number[]>([])
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const refresh = useCallback(() => setSnapshot(session.snapshot()), [session])

  const react = useCallback(
    (events: GameEvent[]) => {
      for (const event of events) {
        if (event.type === 'caught') celebrate('cheer', 'sparkle')
        if (event.type === 'missed') celebrate('oops', 'poof')
        if (event.type === 'gameOver') setResult(recordFinalScore(bestScores, session.snapshot().score))
      }

      function celebrate(nextMood: DinoMood, kind: Burst['kind']) {
        const id = nextBurstId.current++
        const x = session.snapshot().dinoX
        setMood(nextMood)
        setBursts((current) => [...current, { id, x, kind }])
        timers.current.push(
          window.setTimeout(() => {
            setMood('idle')
            setBursts((current) => current.filter((burst) => burst.id !== id))
          }, MOOD_SECONDS * 1000),
        )
      }
    },
    [bestScores, session],
  )

  useAnimationFrame((elapsed) => {
    react(session.advance(elapsed))
    refresh()
  }, snapshot.phase === 'playing')

  const togglePause = useCallback(() => {
    session.togglePause()
    refresh()
  }, [session, refresh])

  useKeyboardControls({
    hold: (direction) => session.hold(direction),
    release: (direction) => session.release(direction),
    togglePause,
  })

  const dragTo = (event: React.PointerEvent) => {
    if (event.buttons === 0 || !stage.current) return
    const box = stage.current.getBoundingClientRect()
    session.dragTo(((event.clientX - box.left) / box.width) * WORLD_WIDTH)
  }

  return (
    <main className="game">
      <div className="game__stage-area">
        <div className="ground-band" />
        <div ref={stage} className="stage" onPointerDown={dragTo} onPointerMove={dragTo}>
          <Playfield dinoX={snapshot.dinoX} ball={snapshot.ball} mood={mood} bursts={bursts} />
        </div>
      </div>
      <Hud score={snapshot.score} lives={snapshot.lives} onPause={togglePause} />
      <TouchControls hold={(d) => session.hold(d)} release={(d) => session.release(d)} />
      {snapshot.phase === 'paused' && <PausedOverlay onResume={togglePause} onMainMenu={onExit} />}
      {snapshot.phase === 'over' && result && (
        <GameOverOverlay score={snapshot.score} result={result} onBackToGames={onExit} />
      )}
    </main>
  )
}

interface TouchControlsProps {
  hold(direction: Direction): void
  release(direction: Direction): void
}

function TouchControls({ hold, release }: TouchControlsProps) {
  return (
    <div className="touch-controls">
      <DirectionButton direction="left" label="Move left" arrow="◀" {...{ hold, release }} />
      <DirectionButton direction="right" label="Move right" arrow="▶" {...{ hold, release }} />
    </div>
  )
}

function DirectionButton({ direction, label, arrow, hold, release }: TouchControlsProps & { direction: Direction; label: string; arrow: string }) {
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
