import type { BrickKind } from './bricks'

export const COLUMNS = 12
export const MAX_LAYERS = 10

export interface PlacedBrick {
  readonly id: string
  readonly kind: BrickKind
  /** The leftmost stud the brick covers. */
  readonly column: number
  /** 0 sits on the plate; each layer up sits on the bricks below. */
  readonly layer: number
}

export type DropResult = { type: 'placed'; brick: PlacedBrick } | { type: 'rejected'; reason: 'offThePlate' | 'towerTooHigh' }

/** The stud a brick of this width covers first when the finger is over `x` (in studs from the left edge). */
export function snapColumn(width: number, x: number): number {
  const centred = Math.round(x - width / 2)
  return Math.min(Math.max(centred, 0), COLUMNS - width)
}

/**
 * The plate the player builds on. A brick dropped over some studs falls until it rests on the plate or on a brick
 * below, so a brick is never left floating.
 */
export class Baseplate {
  private placed: PlacedBrick[] = []
  private nextId = 1

  bricks(): readonly PlacedBrick[] {
    return this.placed
  }

  /** The layer a brick would land on, or null if it cannot go there. */
  landingLayer(kind: BrickKind, column: number): number | null {
    if (column < 0 || column + kind.width > COLUMNS) return null
    const layer = this.restingLayer(kind.width, column)
    return layer < MAX_LAYERS ? layer : null
  }

  drop(kind: BrickKind, column: number): DropResult {
    if (column < 0 || column + kind.width > COLUMNS) return { type: 'rejected', reason: 'offThePlate' }
    const layer = this.restingLayer(kind.width, column)
    if (layer >= MAX_LAYERS) return { type: 'rejected', reason: 'towerTooHigh' }
    const brick: PlacedBrick = { id: `brick-${this.nextId++}`, kind, column, layer }
    this.placed.push(brick)
    return { type: 'placed', brick }
  }

  /** Taking a brick out lets whatever it was holding up fall until something else holds it. */
  remove(id: string): void {
    const remaining = this.placed.filter((brick) => brick.id !== id)
    if (remaining.length === this.placed.length) return
    this.placed = []
    for (const brick of remaining.sort((a, b) => a.layer - b.layer)) {
      this.placed.push({ ...brick, layer: this.restingLayer(brick.kind.width, brick.column) })
    }
  }

  clear(): void {
    this.placed = []
  }

  private restingLayer(width: number, column: number): number {
    return this.placed
      .filter((brick) => brick.column < column + width && column < brick.column + brick.kind.width)
      .reduce((top, brick) => Math.max(top, brick.layer + 1), 0)
  }
}
