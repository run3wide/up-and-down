import type { Direction, Game, GameEvent, GameSnapshot } from '../domain/game'

export const MAX_FRAME_SECONDS = 0.05

export class GameSession {
  private readonly game: Game
  private readonly held = new Set<Direction>()

  constructor(game: Game) {
    this.game = game
  }

  snapshot(): GameSnapshot {
    return this.game.snapshot()
  }

  hold(direction: Direction): void {
    this.held.add(direction)
  }

  release(direction: Direction): void {
    this.held.delete(direction)
  }

  dragTo(x: number): void {
    this.game.placeDino(x)
  }

  togglePause(): void {
    this.game.togglePause()
  }

  advance(elapsedSeconds: number): GameEvent[] {
    const dt = Math.min(elapsedSeconds, MAX_FRAME_SECONDS)
    this.moveHeldDirection(dt)
    return this.game.tick(dt)
  }

  private moveHeldDirection(dt: number): void {
    if (this.held.size !== 1) return
    const [direction] = this.held
    this.game.moveDino(direction, dt)
  }
}
