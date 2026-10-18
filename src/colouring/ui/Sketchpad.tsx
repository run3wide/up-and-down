import { useRef, useState } from 'react'
import { COLOURS } from '../domain/colours'
import { BRUSHES, PAGE_SIZE, type DrawingSnapshot, type Drawing, type Point } from '../domain/drawing'
import { Palette } from './Palette'
import { StrokeArt } from './StrokeArt'

const KEY_STEP = 4
const ARROWS: Record<string, Point> = { ArrowLeft: [-KEY_STEP, 0], ArrowRight: [KEY_STEP, 0], ArrowUp: [0, -KEY_STEP], ArrowDown: [0, KEY_STEP] }

interface SketchpadProps {
  snapshot: DrawingSnapshot
  onChange: (edit: (drawing: Drawing) => void) => void
  onShelf: () => void
}

export function Sketchpad({ snapshot, onChange, onShelf }: SketchpadProps) {
  const [colour, setColour] = useState(COLOURS[0].id)
  const [brush, setBrush] = useState(BRUSHES[1].id)
  const [live, setLive] = useState<readonly Point[]>([])
  const liveRef = useRef<readonly Point[]>([])
  const pen = useRef<Point>([PAGE_SIZE / 2, PAGE_SIZE / 2])
  const pressed = useRef(false)

  const follow = (points: readonly Point[]) => {
    liveRef.current = points
    setLive(points)
  }

  const lift = () => {
    pressed.current = false
    const points = liveRef.current
    if (points.length === 0) return
    follow([])
    onChange((drawing) => drawing.addStroke(colour, brush, points))
  }

  const pointAt = (event: React.PointerEvent<SVGSVGElement>): Point => {
    const box = event.currentTarget.getBoundingClientRect()
    return [((event.clientX - box.left) / box.width) * PAGE_SIZE, ((event.clientY - box.top) / box.height) * PAGE_SIZE]
  }

  const press = (event: React.PointerEvent<SVGSVGElement>) => {
    lift()
    pressed.current = true
    event.currentTarget.setPointerCapture?.(event.pointerId)
    pen.current = pointAt(event)
    follow([pen.current])
  }

  const drag = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!pressed.current) return
    pen.current = pointAt(event)
    follow([...liveRef.current, pen.current])
  }

  const pressKey = (event: React.KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault()
      return lift()
    }
    const step = ARROWS[event.key]
    if (!step) return
    event.preventDefault()
    const from = pen.current
    pen.current = [clamp(from[0] + step[0]), clamp(from[1] + step[1])]
    follow([...(liveRef.current.length === 0 ? [from] : liveRef.current), pen.current])
  }

  const choose = (change: () => void) => {
    lift()
    change()
  }

  return (
    <main className="colouring">
      <header className="colouring__bar">
        <button className="colouring__tool" onClick={onShelf}>
          My pictures
        </button>
        <button className="colouring__tool" onClick={() => onChange((drawing) => drawing.undo())}>
          Undo
        </button>
        <button className="colouring__tool" onClick={() => onChange((drawing) => drawing.clear())}>
          Clear
        </button>
      </header>
      <h1 className="colouring__title">Draw anything you like</h1>
      <svg
        className="colouring__art colouring__pad"
        viewBox={`0 0 ${PAGE_SIZE} ${PAGE_SIZE}`}
        role="application"
        aria-label="Drawing pad. Drag to draw, or use the arrow keys, and space to lift the pen."
        tabIndex={0}
        onPointerDown={press}
        onPointerMove={drag}
        onPointerUp={lift}
        onPointerCancel={lift}
        onKeyDown={pressKey}
        onBlur={lift}
      >
        <StrokeArt strokes={snapshot.strokes} />
        {live.length > 0 && <StrokeArt strokes={[{ colour, brush, points: live }]} />}
      </svg>
      <Palette chosen={colour} onChoose={(next) => choose(() => setColour(next))} />
      <div className="colouring__brushes" role="group" aria-label="Brushes">
        {BRUSHES.map(({ id, name, width }) => (
          <button key={id} className="colouring__brush" aria-label={name} aria-pressed={brush === id} onClick={() => choose(() => setBrush(id))}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="10" cy="10" r={width} />
            </svg>
          </button>
        ))}
      </div>
    </main>
  )
}

const clamp = (n: number) => Math.min(PAGE_SIZE, Math.max(0, n))
