import { Maze, key, stepFrom, type Cell, type Direction } from './maze'

/** Each try starts with this long on the clock; every second left when the last cookie goes is a bonus point. */
export const TIME_LIMIT_SECONDS = 120
export const COOKIE_POINTS = 10
export const MAX_LIVES = 3
/** A super star eats every cookie within this many cells (a square around it) and gives some time back. */
export const BLAST_RADIUS = 2
export const STAR_BONUS_SECONDS = 5

/** `timeUp` waits for another try; `over` is when the last try has gone. */
export type MazePhase = 'ready' | 'playing' | 'won' | 'timeUp' | 'over'

export type MazeEvent =
  | { type: 'cookieEaten'; cell: Cell }
  | { type: 'starCollected'; cell: Cell; cookiesCleared: number }
  | { type: 'won' }
  | { type: 'timeUp'; livesLeft: number }

export interface MazeSnapshot {
  readonly phase: MazePhase
  readonly paused: boolean
  /** The cell the dino is in: (0, 0) is the top-left. */
  readonly x: number
  readonly y: number
  /** The way of its last step; null before the first step of a try. */
  readonly heading: Direction | null
  readonly cookiesEaten: number
  readonly cookiesLeft: number
  readonly remainingCookies: readonly Cell[]
  readonly remainingStars: readonly Cell[]
  readonly secondsLeft: number
  readonly lives: number
  readonly score: number
}

export class MazeGame {
  private readonly maze: Maze
  private readonly timeLimit: number
  private cookies = new Map<string, Cell>()
  private stars = new Map<string, Cell>()
  private cell: Cell
  private heading: Direction | null = null
  private phase: MazePhase = 'ready'
  private paused = false
  private elapsed = 0
  private lives = MAX_LIVES

  constructor(maze: Maze, timeLimit = TIME_LIMIT_SECONDS) {
    this.maze = maze
    this.timeLimit = timeLimit
    this.cell = maze.start
    this.layOut()
  }

  /** One step, one cell. Bumping into a wall does nothing, and does not start the clock. */
  step(direction: Direction): MazeEvent[] {
    if (this.paused || (this.phase !== 'ready' && this.phase !== 'playing')) return []
    const next = stepFrom(this.cell, direction)
    if (!this.maze.isOpen(next)) return []
    this.phase = 'playing'
    this.cell = next
    this.heading = direction
    return this.stars.delete(key(next)) ? this.setOffStar(next) : this.eatCookieHere()
  }

  togglePause(): void {
    if (this.phase !== 'ready' && this.phase !== 'playing') return
    this.paused = !this.paused
  }

  /** Starts the maze again after time ran out, if there is a life left to try with. */
  tryAgain(): void {
    if (this.phase !== 'timeUp') return
    this.cell = this.maze.start
    this.heading = null
    this.elapsed = 0
    this.layOut()
    this.phase = 'ready'
  }

  tick(seconds: number): MazeEvent[] {
    if (this.paused || this.phase !== 'playing') return []
    this.elapsed = Math.min(this.elapsed + seconds, this.timeLimit)
    return this.elapsed < this.timeLimit ? [] : [this.runOutOfTime()]
  }

  snapshot(): MazeSnapshot {
    const eaten = this.maze.cookieCells.length - this.cookies.size
    return {
      phase: this.phase,
      paused: this.paused,
      x: this.cell.column,
      y: this.cell.row,
      heading: this.heading,
      cookiesEaten: eaten,
      cookiesLeft: this.cookies.size,
      remainingCookies: [...this.cookies.values()],
      remainingStars: [...this.stars.values()],
      secondsLeft: this.timeLimit - this.elapsed,
      lives: this.lives,
      score: eaten * COOKIE_POINTS + this.speedBonus(),
    }
  }

  private layOut(): void {
    this.stars = new Map(this.maze.starCells.map((star) => [key(star), star]))
    this.cookies = new Map(this.maze.cookieCells.map((cookie) => [key(cookie), cookie]))
  }

  private speedBonus(): number {
    return this.phase === 'won' ? Math.round(this.timeLimit - this.elapsed) : 0
  }

  private eatCookieHere(): MazeEvent[] {
    if (!this.cookies.delete(key(this.cell))) return []
    return this.afterEating({ type: 'cookieEaten', cell: this.cell })
  }

  private setOffStar(star: Cell): MazeEvent[] {
    const blasted = [...this.cookies.values()].filter((cookie) => isWithin(BLAST_RADIUS, star, cookie))
    for (const cookie of blasted) this.cookies.delete(key(cookie))
    this.elapsed = Math.max(0, this.elapsed - STAR_BONUS_SECONDS)
    return this.afterEating({ type: 'starCollected', cell: star, cookiesCleared: blasted.length })
  }

  private afterEating(eaten: MazeEvent): MazeEvent[] {
    if (this.cookies.size > 0) return [eaten]
    this.phase = 'won'
    return [eaten, { type: 'won' }]
  }

  private runOutOfTime(): MazeEvent {
    this.lives -= 1
    this.phase = this.lives > 0 ? 'timeUp' : 'over'
    return { type: 'timeUp', livesLeft: this.lives }
  }
}

const isWithin = (radius: number, a: Cell, b: Cell): boolean => Math.abs(a.row - b.row) <= radius && Math.abs(a.column - b.column) <= radius
