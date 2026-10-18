import { useRef, useState } from 'react'
import { SoundToggle } from '../../shared/SoundToggle'
import type { SoundPlayer } from '../../shared/sound/SoundPlayer'
import { Baseplate, COLUMNS, MAX_LAYERS, snapColumn } from '../domain/baseplate'
import { BLUEPRINTS, type Blueprint } from '../domain/blueprint'
import { BRICK_KINDS, type BrickKind } from '../domain/bricks'
import { BrickArt } from './BrickArt'
import '../../shared/hud.css'
import '../../shared/overlays.css'
import './builder.css'

const DRAG_THRESHOLD_PX = 8

interface BuilderScreenProps {
  sound: SoundPlayer
  onExit: () => void
}

interface Dragging {
  readonly kind: BrickKind
  readonly x: number
  readonly y: number
  /** Where the pointer is over the plate, in studs from its left edge, or null when it is somewhere else. */
  readonly overPlate: number | null
}

const brickName = (kind: BrickKind) => `${colourName(kind)} brick, ${kind.width} wide`
const colourName = (kind: BrickKind) => kind.id.split('-')[0]
const capitalised = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export function BuilderScreen({ sound, onExit }: BuilderScreenProps) {
  const [plate] = useState(() => new Baseplate())
  const [bricks, setBricks] = useState(() => [...plate.bricks()])
  const [chosen, setChosen] = useState<BrickKind | null>(null)
  const [dragging, setDragging] = useState<Dragging | null>(null)
  const [picture, setPicture] = useState<Blueprint | null>(null)
  const [muted, setMuted] = useState(false)
  const plateRef = useRef<HTMLDivElement>(null)
  const justDragged = useRef(false)

  const refresh = () => setBricks([...plate.bricks()])
  const play = (effect: 'brickSnap' | 'brickPop' | 'builtIt') => {
    sound.unlock()
    if (!muted) sound.play(effect)
  }

  const build = (kind: BrickKind, column: number) => {
    const wasBuilt = picture?.isBuiltOn(plate.bricks()) ?? false
    const result = plate.drop(kind, column)
    refresh()
    if (result.type === 'rejected') return
    play('brickSnap')
    if (picture?.isBuiltOn(plate.bricks()) && !wasBuilt) play('builtIt')
  }

  const takeOff = (id: string) => {
    plate.remove(id)
    refresh()
    play('brickPop')
  }

  const choosePicture = (next: Blueprint | null) => {
    plate.clear()
    refresh()
    setChosen(null)
    setPicture(next)
  }

  const nextPicture = () => {
    if (!picture) return
    choosePicture(BLUEPRINTS[(BLUEPRINTS.indexOf(picture) + 1) % BLUEPRINTS.length])
  }

  const studsOverPlate = (clientX: number, clientY: number): number | null => {
    const rect = plateRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return null
    const inside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
    return inside ? ((clientX - rect.left) / rect.width) * COLUMNS : null
  }

  const startDrag = (kind: BrickKind, event: React.PointerEvent) => {
    const start = { x: event.clientX, y: event.clientY }
    let moved = false
    const move = (e: PointerEvent) => {
      moved ||= Math.hypot(e.clientX - start.x, e.clientY - start.y) > DRAG_THRESHOLD_PX
      if (moved) setDragging({ kind, x: e.clientX, y: e.clientY, overPlate: studsOverPlate(e.clientX, e.clientY) })
    }
    const end = (e: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      setDragging(null)
      if (!moved) return
      justDragged.current = true
      setTimeout(() => (justDragged.current = false), 0)
      const studs = studsOverPlate(e.clientX, e.clientY)
      if (studs !== null && e.type === 'pointerup') build(kind, snapColumn(kind.width, studs))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  const tapKind = (kind: BrickKind) => {
    if (justDragged.current) return
    setChosen(chosen?.id === kind.id ? null : kind)
  }

  const putInColumn = (column: number) => {
    if (!chosen) return
    build(chosen, snapColumn(chosen.width, column + 0.5))
    setChosen(null)
  }

  const landing = dragging && dragging.overPlate !== null ? previewOf(plate, dragging.kind, dragging.overPlate) : null
  const progress = picture?.progress(bricks)
  const finished = picture?.isBuiltOn(bricks) ?? false

  return (
    <main className="brick-builder">
      <header className="brick-builder__bar">
        <button className="brick-builder__tool" onClick={onExit}>
          Back to games
        </button>
        <button className="brick-builder__tool" onClick={() => (plate.clear(), refresh())}>
          Start again
        </button>
        <SoundToggle muted={muted} onToggle={() => setMuted(!muted)} />
      </header>
      <h1 className="brick-builder__title">Brick Builder</h1>
      <div className="brick-builder__pictures" role="group" aria-label="Pictures">
        {[null, ...BLUEPRINTS].map((option) => (
          <button
            key={option?.id ?? 'free'}
            className="brick-builder__tool"
            aria-pressed={picture === option}
            onClick={() => choosePicture(option)}
          >
            {option?.name ?? 'Free build'}
          </button>
        ))}
      </div>
      <p className="brick-builder__message" role="status">
        {picture && progress
          ? finished
            ? `You built the ${picture.name}! 🎉`
            : `Build the ${picture.name}: ${progress.built} of ${progress.total} bricks`
          : chosen
            ? 'Now tap where it goes!'
            : bricks.length === 0
              ? 'Pick a brick and build!'
              : 'Tap a brick to take it off.'}
      </p>
      {finished && (
        <button className="brick-builder__tool" autoFocus onClick={nextPicture}>
          Next picture
        </button>
      )}
      <div className="brick-builder__plate" ref={plateRef} role="group" aria-label="Baseplate">
        {picture?.pieces
          .filter((piece) => !picture.isBuilt(piece, bricks))
          .map((piece) => (
            <span
              key={`${piece.column}-${piece.layer}`}
              data-testid="guide"
              className="brick-builder__guide"
              aria-hidden="true"
              style={{ left: `${(piece.column / COLUMNS) * 100}%`, bottom: `${(piece.layer / MAX_LAYERS) * 100}%`, width: `${(piece.kind.width / COLUMNS) * 100}%`, background: piece.kind.colour }}
            />
          ))}
        {bricks.map((placed) => (
          <button
            key={placed.id}
            className="brick-builder__placed"
            style={{ left: `${(placed.column / COLUMNS) * 100}%`, bottom: `${(placed.layer / MAX_LAYERS) * 100}%`, width: `${(placed.kind.width / COLUMNS) * 100}%` }}
            aria-label={`Take off ${brickName(placed.kind)}`}
            onClick={() => takeOff(placed.id)}
          >
            <BrickArt width={placed.kind.width} colour={placed.kind.colour} />
          </button>
        ))}
        {landing && (
          <span
            className="brick-builder__landing"
            aria-hidden="true"
            style={{ left: `${(landing.column / COLUMNS) * 100}%`, bottom: `${(landing.layer / MAX_LAYERS) * 100}%`, width: `${(dragging!.kind.width / COLUMNS) * 100}%` }}
          />
        )}
        {chosen && (
          <div className="brick-builder__columns">
            {Array.from({ length: COLUMNS }, (_, column) => (
              <button key={column} className="brick-builder__column" aria-label={`Put it in column ${column + 1}`} onClick={() => putInColumn(column)} />
            ))}
          </div>
        )}
      </div>
      <div className="brick-builder__base" aria-hidden="true" />
      <div className="brick-builder__tray" role="group" aria-label="Bricks">
        {BRICK_KINDS.map((kind) => (
          <button
            key={kind.id}
            className={`brick-builder__choice${chosen?.id === kind.id ? ' brick-builder__choice--chosen' : ''}`}
            style={{ width: `${kind.width * 2.2 + 1}rem` }}
            aria-label={capitalised(brickName(kind))}
            aria-pressed={chosen?.id === kind.id}
            onPointerDown={(event) => startDrag(kind, event)}
            onClick={() => tapKind(kind)}
          >
            <BrickArt width={kind.width} colour={kind.colour} />
          </button>
        ))}
      </div>
      {dragging && (
        <span className="brick-builder__ghost" aria-hidden="true" style={{ left: dragging.x, top: dragging.y, width: `${dragging.kind.width * 2.2}rem` }}>
          <BrickArt width={dragging.kind.width} colour={dragging.kind.colour} />
        </span>
      )}
    </main>
  )
}

function previewOf(plate: Baseplate, kind: BrickKind, studs: number): { column: number; layer: number } | null {
  const column = snapColumn(kind.width, studs)
  const layer = plate.landingLayer(kind, column)
  return layer === null ? null : { column, layer }
}
