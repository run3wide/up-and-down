import type { Direction } from '../domain/maze'
import type { MazeEvent } from '../domain/mazeGame'
import type { MazeRun, MazeRunSnapshot } from '../domain/mazeRun'

export const MAX_FRAME_SECONDS = 0.25

export class MazeSession {
  private readonly run: MazeRun

  constructor(run: MazeRun) {
    this.run = run
  }

  snapshot(): MazeRunSnapshot {
    return this.run.snapshot()
  }

  step(direction: Direction): MazeEvent[] {
    return this.run.step(direction)
  }

  tryAgain(): void {
    this.run.tryAgain()
  }

  nextMaze(): void {
    this.run.nextMaze()
  }

  togglePause(): void {
    this.run.togglePause()
  }

  /** Frame time is clamped so a hidden tab can't burn the clock. */
  advance(elapsedSeconds: number): MazeEvent[] {
    return this.run.tick(Math.min(elapsedSeconds, MAX_FRAME_SECONDS))
  }
}
