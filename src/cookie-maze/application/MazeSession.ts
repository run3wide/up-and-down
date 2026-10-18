import type { Direction } from '../domain/maze'
import type { MazeEvent, MazeGame, MazeSnapshot } from '../domain/mazeGame'

export const MAX_FRAME_SECONDS = 0.05

export class MazeSession {
  private readonly game: MazeGame

  constructor(game: MazeGame) {
    this.game = game
  }

  snapshot(): MazeSnapshot {
    return this.game.snapshot()
  }

  steer(direction: Direction): void {
    this.game.steer(direction)
  }

  togglePause(): void {
    this.game.togglePause()
  }

  advance(elapsedSeconds: number): MazeEvent[] {
    return this.game.tick(Math.min(elapsedSeconds, MAX_FRAME_SECONDS))
  }
}
