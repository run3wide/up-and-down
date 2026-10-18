export type Direction = 'up' | 'down' | 'left' | 'right'

export interface Cell {
  readonly row: number
  readonly column: number
}

export class MazeLayoutError extends Error {}

const STEPS: Record<Direction, Cell> = {
  up: { row: -1, column: 0 },
  down: { row: 1, column: 0 },
  left: { row: 0, column: -1 },
  right: { row: 0, column: 1 },
}

const OPPOSITES: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' }

export const stepFrom = (cell: Cell, direction: Direction): Cell => ({
  row: cell.row + STEPS[direction].row,
  column: cell.column + STEPS[direction].column,
})

export const opposite = (direction: Direction): Direction => OPPOSITES[direction]

const WALL = '#'
const START = 'S'

/** A drawing of the maze: `#` is wall, `S` is where the dino starts, and every other cell is a path with a cookie on it. */
export class Maze {
  readonly rows: number
  readonly columns: number
  readonly start: Cell
  readonly cookieCells: readonly Cell[]
  private readonly drawing: readonly string[]

  private constructor(drawing: readonly string[], start: Cell, cookieCells: readonly Cell[]) {
    this.drawing = drawing
    this.rows = drawing.length
    this.columns = drawing[0].length
    this.start = start
    this.cookieCells = cookieCells
  }

  static fromRows(drawing: readonly string[]): Maze {
    const columns = drawing[0]?.length ?? 0
    if (drawing.some((row) => row.length !== columns)) throw new MazeLayoutError('Every row of the maze must be the same length')

    const cells = drawing.flatMap((text, row) => [...text].map((mark, column) => ({ mark, cell: { row, column } })))
    const starts = cells.filter(({ mark }) => mark === START)
    if (starts.length !== 1) throw new MazeLayoutError('The maze needs exactly one start')

    const maze = new Maze(
      drawing,
      starts[0].cell,
      cells.filter(({ mark }) => mark !== WALL && mark !== START).map(({ cell }) => cell),
    )
    if (maze.cookieCells.some((cell) => !maze.reachableFromStart().has(key(cell)))) {
      throw new MazeLayoutError('Every cookie must be reachable from the start')
    }
    return maze
  }

  isOpen(cell: Cell): boolean {
    const mark = this.drawing[cell.row]?.[cell.column]
    return mark !== undefined && mark !== WALL
  }

  private reachableFromStart(): Set<string> {
    const seen = new Set([key(this.start)])
    const frontier = [this.start]
    for (let cell = frontier.pop(); cell; cell = frontier.pop()) {
      for (const direction of Object.keys(STEPS) as Direction[]) {
        const next = stepFrom(cell, direction)
        if (this.isOpen(next) && !seen.has(key(next))) {
          seen.add(key(next))
          frontier.push(next)
        }
      }
    }
    return seen
  }
}

export const key = (cell: Cell): string => `${cell.row},${cell.column}`
