import type { Direction, Maze } from './maze'
import { MazeGame, type MazeEvent, type MazeSnapshot } from './mazeGame'

export interface MazeLevel {
  readonly maze: Maze
  /** Seconds on the clock for each try at this maze. */
  readonly timeLimit: number
}

export interface MazeRunSnapshot extends MazeSnapshot {
  readonly maze: Maze
  readonly mazeNumber: number
  readonly mazeCount: number
  /** Score so far across every maze, including this one. */
  readonly runScore: number
  /** The last maze has been won. */
  readonly allCleared: boolean
}

/** A trip through the mazes in order. Each maze has its own clock and a full set of tries; the score adds up. */
export class MazeRun {
  private readonly levels: readonly MazeLevel[]
  private levelIndex = 0
  private game: MazeGame
  private bankedScore = 0

  constructor(levels: readonly MazeLevel[]) {
    this.levels = levels
    this.game = this.startLevel()
  }

  step(direction: Direction): MazeEvent[] {
    return this.game.step(direction)
  }

  tick(seconds: number): MazeEvent[] {
    return this.game.tick(seconds)
  }

  tryAgain(): void {
    this.game.tryAgain()
  }

  togglePause(): void {
    this.game.togglePause()
  }

  /** Moves on once the current maze is won; does nothing before that, or after the last maze. */
  nextMaze(): void {
    if (this.game.snapshot().phase !== 'won' || this.isLastMaze()) return
    this.bankedScore += this.game.snapshot().score
    this.levelIndex += 1
    this.game = this.startLevel()
  }

  snapshot(): MazeRunSnapshot {
    const snapshot = this.game.snapshot()
    return {
      ...snapshot,
      maze: this.levels[this.levelIndex].maze,
      mazeNumber: this.levelIndex + 1,
      mazeCount: this.levels.length,
      runScore: this.bankedScore + snapshot.score,
      allCleared: snapshot.phase === 'won' && this.isLastMaze(),
    }
  }

  private startLevel(): MazeGame {
    const { maze, timeLimit } = this.levels[this.levelIndex]
    return new MazeGame(maze, timeLimit)
  }

  private isLastMaze(): boolean {
    return this.levelIndex === this.levels.length - 1
  }
}
