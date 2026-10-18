import { COLOURS } from './colours'

export interface Brush {
  readonly id: string
  readonly name: string
  /** Line width in the 100x100 box a drawing lives in. */
  readonly width: number
}

export const BRUSHES: readonly Brush[] = [
  { id: 'thin', name: 'Thin', width: 1.5 },
  { id: 'medium', name: 'Medium', width: 3.5 },
  { id: 'thick', name: 'Thick', width: 7 },
]

export const PAGE_SIZE = 100

export type Point = readonly [number, number]

export interface Stroke {
  readonly colour: string
  readonly brush: string
  readonly points: readonly Point[]
}

export interface DrawingSnapshot {
  readonly strokes: readonly Stroke[]
}

const onThePage = (n: number) => Math.round(Math.min(PAGE_SIZE, Math.max(0, n)) * 10) / 10

/** A free drawing: coloured strokes on a blank page, one on top of another. */
export class Drawing {
  private strokes: readonly Stroke[] = []
  private history: (readonly Stroke[])[] = []

  constructor(saved: readonly Stroke[] = []) {
    for (const { colour, brush, points } of saved) this.addStroke(colour, brush, points)
    this.history = []
  }

  addStroke(colour: string, brush: string, points: readonly Point[]) {
    const kept = tidy(points)
    if (kept.length === 0 || !COLOURS.some(({ id }) => id === colour) || !BRUSHES.some(({ id }) => id === brush)) return
    this.remember()
    this.strokes = [...this.strokes, { colour, brush, points: kept }]
  }

  undo() {
    this.strokes = this.history.pop() ?? this.strokes
  }

  clear() {
    if (this.strokes.length === 0) return
    this.remember()
    this.strokes = []
  }

  snapshot(): DrawingSnapshot {
    return { strokes: this.strokes }
  }

  private remember() {
    this.history.push(this.strokes)
  }
}

function tidy(points: readonly Point[]): Point[] {
  const kept: Point[] = []
  for (const [x, y] of points) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue
    const point: Point = [onThePage(x), onThePage(y)]
    const last = kept.at(-1)
    if (!last || last[0] !== point[0] || last[1] !== point[1]) kept.push(point)
  }
  return kept
}
