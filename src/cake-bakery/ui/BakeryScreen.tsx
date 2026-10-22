import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { recordFinalScore, type BestScoreStore } from '../../shared/bestScore'
import { FrameControls } from '../../shared/frame/FrameControls'
import { Overlay, PausedOverlay } from '../../shared/Overlays'
import { BakeGame, type BakeEvent, type Cake, type Tile } from '../domain/bakeGame'
import type { Step } from '../domain/ingredients'
import type { SumQuiz } from '../domain/sum'
import { CakeArt } from './CakeArt'
import '../../shared/hud.css'
import './bakery.css'

const NUH_UH_MS = 600
const DRAG_THRESHOLD_PX = 8
const INTRO = 'Drag a number and a thing into each blank, or tap a tile and then a blank!'

const STEP_TITLES: Record<Step, string> = {
  shape: 'Pick a shape',
  flavour: 'Pick a flavour',
  frosting: 'Pick a frosting',
  topping: 'Pick a topping',
}

interface BakeryScreenProps {
  createQuiz: () => SumQuiz
  bestScores: BestScoreStore
  onExit: () => void
}

interface Drag {
  readonly tile: Tile
  readonly startX: number
  readonly startY: number
  moved: boolean
}

const label = (tile: Tile): string => (tile.kind === 'count' ? String(tile.count) : tile.symbol)
const slotWants = (slot: number): Tile['kind'] => (slot % 2 === 0 ? 'count' : 'symbol')

export function BakeryScreen({ createQuiz, bestScores, onExit }: BakeryScreenProps) {
  const [game] = useState(() => new BakeGame(createQuiz()))
  const [snapshot, setSnapshot] = useState(() => game.snapshot())
  const [best, setBest] = useState(() => bestScores.load())
  const [message, setMessage] = useState(INTRO)
  const [selected, setSelected] = useState<string | null>(null)
  const [shaking, setShaking] = useState(false)
  const [ghost, setGhost] = useState<{ text: string; x: number; y: number } | null>(null)
  const [paused, setPaused] = useState(false)
  const drag = useRef<Drag | null>(null)
  const justDragged = useRef(false)

  const react = useCallback(
    (events: BakeEvent[]) => {
      for (const event of events) {
        if (event.type === 'answeredRight') setMessage(`Yes! ${event.explanation}`)
        if (event.type === 'wrongAnswer') {
          setShaking(true)
          setMessage('Not quite - have another go!')
        }
        if (event.type === 'chosen') setMessage(`${event.choice.name}! ${event.choice.emoji}`)
        if (event.type === 'cakeBaked') setBest(recordFinalScore(bestScores, game.snapshot().cakesBaked).best)
      }
    },
    [bestScores, game],
  )

  const act = (events: BakeEvent[]) => {
    react(events)
    setSnapshot(game.snapshot())
  }

  useEffect(() => {
    if (!shaking) return
    const timer = setTimeout(() => setShaking(false), NUH_UH_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  const place = (tile: Tile, slot: number) => {
    setSelected(null)
    if (tile.kind !== slotWants(slot)) {
      setMessage('Numbers go in the number blanks, and things go in the thing blanks.')
      return
    }
    setMessage('')
    act(game.place(tile.id, slot))
  }

  const tapTile = (tile: Tile) => {
    if (justDragged.current) return
    setSelected(selected === tile.id ? null : tile.id)
  }

  const tapBlank = (slot: number) => {
    const tile = snapshot.tray.find((candidate) => candidate.id === selected)
    if (tile) return place(tile, slot)
    game.takeBack(slot)
    setSnapshot(game.snapshot())
  }

  const startDrag = (tile: Tile, event: React.PointerEvent) => {
    drag.current = { tile, startX: event.clientX, startY: event.clientY, moved: false }
    const move = (e: PointerEvent) => {
      const current = drag.current
      if (!current) return
      current.moved ||= Math.hypot(e.clientX - current.startX, e.clientY - current.startY) > DRAG_THRESHOLD_PX
      if (current.moved) setGhost({ text: label(tile), x: e.clientX, y: e.clientY })
    }
    const end = (e: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      const current = drag.current
      drag.current = null
      setGhost(null)
      if (!current?.moved) return
      justDragged.current = true
      setTimeout(() => (justDragged.current = false), 0)
      const blank = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-slot]')
      if (blank && e.type === 'pointerup') place(tile, Number(blank.dataset.slot))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  const bakeAnother = () => {
    game.nextCake()
    setSnapshot(game.snapshot())
    setMessage(INTRO)
  }

  const { phase, step, prompt, slots, tray, choices, cake } = snapshot
  const answering = phase === 'question'

  return (
    <main className="bakery">
      <header className="hud">
        <p className="hud__score" role="note">
          Best: {best}
        </p>
        <p className="hud__score" role="status">
          Cakes: {snapshot.cakesBaked}
        </p>
      </header>
      <FrameControls pause={{ paused, onPause: () => setPaused(true) }} />
      {phase !== 'baked' && <CakePreview cake={cake} />}
      <h1 className="bakery__step">{phase === 'baked' ? 'Yum!' : STEP_TITLES[step]}</h1>
      {phase !== 'baked' && (
        <section className="bakery__question" aria-label="Sum">
          <p className="bakery__prompt">{prompt}</p>
          <div className={`bakery__blanks${shaking ? ' bakery__answer--nuh-uh' : ''}`} role="group" aria-label="Answer">
            {Array.from({ length: slots.length / 2 }, (_, group) => (
              <Fragment key={group}>
                {group > 0 && <span className="bakery__plus" aria-hidden="true">+</span>}
                {[group * 2, group * 2 + 1].map((slot) => (
                  <Blank key={slot} slot={slot} placed={slots[slot]} disabled={paused || !answering} onTap={() => tapBlank(slot)} />
                ))}
              </Fragment>
            ))}
          </div>
          {answering && (
            <div className="bakery__tiles" role="group" aria-label="Tiles">
              {tray.map((tile) => (
                <button
                  key={tile.id}
                  className={`bakery__tile bakery__tile--${tile.kind}${selected === tile.id ? ' bakery__tile--selected' : ''}`}
                  aria-label={label(tile)}
                  disabled={paused}
                  onPointerDown={(event) => startDrag(tile, event)}
                  onClick={() => tapTile(tile)}
                >
                  {label(tile)}
                </button>
              ))}
            </div>
          )}
        </section>
      )}
      <p className="bakery__message" role="alert">
        {message}
      </p>
      {phase === 'choosing' && (
        <div className="bakery__choices" role="group" aria-label="Choices">
          {choices.map((choice) => (
            <button key={choice.name} className="bakery__choice" aria-label={choice.name} disabled={paused} onClick={() => act(game.choose(choice.name))}>
              <span className="bakery__choice-picture" aria-hidden="true">
                {choice.emoji}
              </span>
              <span aria-hidden="true">{choice.name}</span>
            </button>
          ))}
        </div>
      )}
      {ghost && (
        <span className="bakery__ghost" aria-hidden="true" style={{ left: ghost.x, top: ghost.y }}>
          {ghost.text}
        </span>
      )}
      {paused && <PausedOverlay onResume={() => setPaused(false)} onMainMenu={onExit} />}
      {phase === 'baked' && !paused && (
        <Overlay title="Your cake is ready!">
          <CakePreview cake={cake} />
          <button className="big-button" autoFocus onClick={bakeAnother}>
            Bake another cake
          </button>
        </Overlay>
      )}
    </main>
  )
}

interface BlankProps {
  slot: number
  placed: Tile | null
  disabled: boolean
  onTap: () => void
}

function Blank({ slot, placed, disabled, onTap }: BlankProps) {
  const kind = slotWants(slot)
  const name = kind === 'count' ? 'Number' : 'Thing'
  const group = Math.floor(slot / 2) + 1
  return (
    <button
      data-slot={slot}
      className={`bakery__blank bakery__blank--${kind}${placed ? ' bakery__blank--filled' : ''}`}
      aria-label={placed ? `${name} ${label(placed)}` : `${name} blank ${group}`}
      disabled={disabled}
      onClick={onTap}
    >
      {placed ? label(placed) : ''}
    </button>
  )
}

function CakePreview({ cake }: { cake: Cake }) {
  return (
    <div className="bakery__cake" role="img" aria-label={describe(cake)}>
      <CakeArt cake={cake} />
    </div>
  )
}

function describe({ shape, flavour, frosting, topping }: Cake): string {
  if (shape && flavour && frosting && topping) {
    return `A ${shape.name} cake: ${flavour.name} cake, ${frosting.name} frosting and ${topping.name} on top`
  }
  const soFar = [shape?.name, flavour && `${flavour.name} cake`, frosting && `${frosting.name} frosting`].filter(Boolean)
  return soFar.length === 0 ? 'Your cake is empty so far' : `Your cake so far: ${soFar.join(', ')}`
}
