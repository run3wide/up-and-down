import type { Direction } from '../domain/maze'
import type { MazeEvent, MazeGame, MazeSnapshot } from '../domain/mazeGame'

export const MAX_FRAME_SECONDS = 0.25

export class MazeSession {
  private readonly game: MazeGame

  constructor(game: MazeGame) {
    this.game = game
  }

  snapshot(): MazeSnapshot {
    return this.game.snapshot()
  }

  step(direction: Direction): MazeEvent[] {
    return this.game.step(direction)
  }

  tryAgain(): void {
    this.game.tryAgain()
  }

  togglePause(): void {
    this.game.togglePause()
  }

  /** Frame time is clamped so a hidden tab can't burn the clock. */
  advance(elapsedSeconds: number): MazeEvent[] {
    return this.game.tick(Math.min(elapsedSeconds, MAX_FRAME_SECONDS))
  }
}
