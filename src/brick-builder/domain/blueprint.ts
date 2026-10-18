import type { PlacedBrick } from './baseplate'
import { BRICK_KINDS, type BrickKind } from './bricks'

/** Where one brick of a picture goes. */
export interface Piece {
  readonly kind: BrickKind
  readonly column: number
  readonly layer: number
}

/** A picture to build out of bricks. Colours are a suggestion: a piece is built by a brick of its width in its spot. */
export class Blueprint {
  readonly id: string
  readonly name: string
  readonly pieces: readonly Piece[]

  constructor(id: string, name: string, pieces: readonly Piece[]) {
    this.id = id
    this.name = name
    this.pieces = pieces
  }

  isBuilt(piece: Piece, bricks: readonly PlacedBrick[]): boolean {
    return bricks.some((brick) => brick.column === piece.column && brick.layer === piece.layer && brick.kind.width === piece.kind.width)
  }

  progress(bricks: readonly PlacedBrick[]): { built: number; total: number } {
    return { built: this.pieces.filter((piece) => this.isBuilt(piece, bricks)).length, total: this.pieces.length }
  }

  isBuiltOn(bricks: readonly PlacedBrick[]): boolean {
    const { built, total } = this.progress(bricks)
    return built === total
  }
}

const piece = (kindId: string, column: number, layer: number): Piece => {
  const kind = BRICK_KINDS.find((candidate) => candidate.id === kindId)
  if (!kind) throw new Error(`No brick called ${kindId} in the tray`)
  return { kind, column, layer }
}

export const BLUEPRINTS: readonly Blueprint[] = [
  new Blueprint('house', 'House', [
    piece('orange-2', 3, 0),
    piece('orange-2', 6, 0),
    piece('teal-4', 3, 1),
    piece('pink-1', 7, 1),
    piece('green-3', 4, 2),
    piece('yellow-1', 5, 3),
  ]),
  new Blueprint('rocket', 'Rocket', [
    piece('yellow-1', 3, 0),
    piece('green-3', 4, 0),
    piece('yellow-1', 7, 0),
    piece('purple-3', 4, 1),
    piece('green-3', 4, 2),
    piece('pink-1', 5, 3),
  ]),
  new Blueprint('truck', 'Truck', [
    piece('yellow-1', 3, 0),
    piece('yellow-1', 8, 0),
    piece('blue-4', 3, 1),
    piece('purple-3', 7, 1),
    piece('green-3', 3, 2),
    piece('red-2', 8, 2),
    piece('pink-1', 9, 3),
  ]),
]
