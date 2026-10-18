import { Maze, key, opposite, stepFrom, type Cell, type Direction } from './maze'

export const CELLS_PER_SECOND = 4
export const COOKIE_POINTS = 10
/** Finishing faster than this earns a point per second to spare. */
export const PAR_SECONDS = 90

export type MazePhase = 'ready' | 'playing' | 'won'

export type MazeEvent = { type: 'cookieEaten'; cell: Cell } | { type: 'won' }

export interface MazeSnapshot {
  readonly phase: MazePhase
  readonly paused: boolean
  /** Where the dino is, in cells: (0, 0) is the middle of the top-left cell. */
  readonly x: number
  readonly y: number
  /** The way it is walking now; null while it waits against a wall. */
  readonly heading: Direction | null
  readonly cookiesEaten: number
  readonly cookiesLeft: number
  readonly remainingCookies: readonly Cell[]
  readonly elapsed: number
  readonly score: number
}

export class MazeGame {
  private readonly maze: Maze
  private readonly cookies: Map<string, Cell>
  private cell: Cell
  private heading: Direction | null = null
  /** How far along the way to the next cell, from 0 (standing in `cell`) up to 1. */
  private progress = 0
  /** The turn the player last asked for; taken at the first gap that allows it. */
  private wanted: Direction | null = null
  private phase: MazePhase = 'ready'
  private paused = false
  private elapsed = 0

  constructor(maze: Maze) {
    this.maze = maze
    this.cell = maze.start
    this.cookies = new Map(maze.cookieCells.map((cookie) => [key(cookie), cookie]))
  }

  steer(direction: Direction): void {
    if (this.phase === 'won') return
    this.phase = 'playing'
    this.wanted = direction
    if (this.progress > 0 && this.heading !== null && direction === opposite(this.heading)) this.turnRound()
    else if (this.progress === 0) this.chooseHeading()
  }

  togglePause(): void {
    this.paused = !this.paused
  }

  tick(seconds: number): MazeEvent[] {
    if (this.paused || this.phase !== 'playing') return []
    this.elapsed += seconds
    const events: MazeEvent[] = []
    let cellsToWalk = seconds * CELLS_PER_SECOND
    while (cellsToWalk > 0) {
      if (this.progress === 0) this.chooseHeading()
      if (this.heading === null) break
      const step = Math.min(cellsToWalk, 1 - this.progress)
      this.progress += step
      cellsToWalk -= step
      if (this.progress < 1) break
      events.push(...this.arrive())
      if (this.hasWon()) {
        this.elapsed -= cellsToWalk / CELLS_PER_SECOND
        break
      }
    }
    return events
  }

  snapshot(): MazeSnapshot {
    const ahead = this.heading === null ? null : stepFrom({ row: 0, column: 0 }, this.heading)
    const eaten = this.maze.cookieCells.length - this.cookies.size
    return {
      phase: this.phase,
      paused: this.paused,
      x: this.cell.column + (ahead?.column ?? 0) * this.progress,
      y: this.cell.row + (ahead?.row ?? 0) * this.progress,
      heading: this.heading,
      cookiesEaten: eaten,
      cookiesLeft: this.cookies.size,
      remainingCookies: [...this.cookies.values()],
      elapsed: this.elapsed,
      score: eaten * COOKIE_POINTS + this.speedBonus(),
    }
  }

  private hasWon(): boolean {
    return this.phase === 'won'
  }

  private speedBonus(): number {
    return this.hasWon() ? Math.max(0, Math.round(PAR_SECONDS - this.elapsed)) : 0
  }

  private chooseHeading(): void {
    if (this.wanted !== null && this.maze.isOpen(stepFrom(this.cell, this.wanted))) this.heading = this.wanted
    else if (this.heading !== null && !this.maze.isOpen(stepFrom(this.cell, this.heading))) this.heading = null
  }

  private turnRound(): void {
    if (this.heading === null) return
    this.cell = stepFrom(this.cell, this.heading)
    this.progress = 1 - this.progress
    this.heading = opposite(this.heading)
  }

  private arrive(): MazeEvent[] {
    this.cell = stepFrom(this.cell, this.heading!)
    this.progress = 0
    if (!this.cookies.delete(key(this.cell))) return []
    const eaten: MazeEvent = { type: 'cookieEaten', cell: this.cell }
    if (this.cookies.size > 0) return [eaten]
    this.phase = 'won'
    this.heading = null
    return [eaten, { type: 'won' }]
  }
}
