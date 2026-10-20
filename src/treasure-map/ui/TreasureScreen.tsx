import { useCallback, useEffect, useRef, useState } from 'react'
import { recordFinalScore, type BestScoreStore } from '../../shared/bestScore'
import { FrameControls } from '../../shared/frame/FrameControls'
import { Overlay, PausedOverlay } from '../../shared/Overlays'
import type { SoundPlayer } from '../../shared/sound/SoundPlayer'
import { describeLegs, type Hunt } from '../domain/hunt'
import type { Compass } from '../domain/island'
import { TreasureGame, type TreasureEvent } from '../domain/treasureGame'
import { TreasureMap } from './TreasureMap'
import '../../shared/hud.css'
import './treasure.css'

interface TreasureScreenProps {
  /** A new map for the next treasure, given how many have been found so far. */
  newHunt: (huntsFound: number) => Hunt
  bestScores: BestScoreStore
  sound: SoundPlayer
  onExit: () => void
}

const KEYS: Record<string, Compass> = {
  ArrowUp: 'north',
  w: 'north',
  W: 'north',
  ArrowDown: 'south',
  s: 'south',
  S: 'south',
  ArrowRight: 'east',
  d: 'east',
  D: 'east',
  ArrowLeft: 'west',
  a: 'west',
  A: 'west',
}

const ARROWS: readonly { compass: Compass; arrow: string }[] = [
  { compass: 'north', arrow: '▲' },
  { compass: 'west', arrow: '◀' },
  { compass: 'east', arrow: '▶' },
  { compass: 'south', arrow: '▼' },
]

const INTRO = 'Start at the ⛵ and fly the parrot where the clue says!'

export function TreasureScreen({ newHunt, bestScores, sound, onExit }: TreasureScreenProps) {
  const [game] = useState(() => new TreasureGame(newHunt))
  const [snapshot, setSnapshot] = useState(() => game.snapshot())
  const [best, setBest] = useState(() => bestScores.load())
  const [message, setMessage] = useState(INTRO)
  const [muted, setMuted] = useState(false)
  const [paused, setPaused] = useState(false)

  const react = useCallback(
    (events: TreasureEvent[]) => {
      for (const event of events) {
        if (event.type === 'landmarkFound') {
          setMessage(`You found the ${event.landmark.emoji} ${event.landmark.name}! Here is the next clue.`)
          if (!muted) sound.play('brickSnap')
        }
        if (event.type === 'treasureFound') {
          setBest(recordFinalScore(bestScores, game.snapshot().found).best)
          if (!muted) sound.play('builtIt')
        }
      }
    },
    [bestScores, game, muted, sound],
  )

  const fly = useCallback(
    (compass: Compass) => {
      if (paused) return
      sound.unlock()
      react(game.move(compass))
      setSnapshot(game.snapshot())
    },
    [game, paused, react, sound],
  )

  const latestFly = useRef(fly)
  useEffect(() => {
    latestFly.current = fly
  })
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const compass = KEYS[event.key]
      if (!compass) return
      event.preventDefault()
      latestFly.current(compass)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const backToClueStart = () => {
    game.backToClueStart()
    setSnapshot(game.snapshot())
  }

  const nextTreasure = () => {
    game.nextHunt()
    setSnapshot(game.snapshot())
    setMessage(INTRO)
  }

  return (
    <main className="treasure-map">
      <header className="hud">
        <p className="hud__score" role="note">
          Best: {best}
        </p>
        <p className="hud__score" role="status">
          Treasure: {snapshot.found}
        </p>
      </header>
      <FrameControls sound={{ muted, onToggle: () => setMuted(!muted) }} pause={{ paused, onPause: () => setPaused(true) }} />
      <div className="treasure-map__map-area">
        <TreasureMap snapshot={snapshot} />
      </div>
      <section className="treasure-map__clue" aria-label="Clue">
        <p className="treasure-map__clue-number">
          Clue {snapshot.clueNumber} of {snapshot.clueCount}
        </p>
        <p className="treasure-map__clue-steps">{describeLegs(snapshot.clue.legs)}</p>
        <p className="treasure-map__message" role="alert">
          {message}
        </p>
      </section>
      <div className="treasure-map__arrows" role="group" aria-label="Compass">
        {ARROWS.map(({ compass, arrow }) => (
          <button key={compass} className={`direction-button treasure-map__arrow treasure-map__arrow--${compass}`} aria-label={`Fly ${compass}`} onClick={() => fly(compass)}>
            <span aria-hidden="true">{arrow}</span>
            <span className="treasure-map__arrow-name" aria-hidden="true">
              {compass}
            </span>
          </button>
        ))}
        <button className="big-button big-button--quiet treasure-map__back" onClick={backToClueStart}>
          Back to the start of this clue
        </button>
      </div>
      {paused && <PausedOverlay onResume={() => setPaused(false)} onMainMenu={onExit} />}
      {snapshot.phase === 'found' && !paused && (
        <Overlay title="Treasure!">
          <p className="overlay__message">You found the treasure! 💰</p>
          <button className="big-button" autoFocus onClick={nextTreasure}>
            Next treasure
          </button>
        </Overlay>
      )}
    </main>
  )
}
