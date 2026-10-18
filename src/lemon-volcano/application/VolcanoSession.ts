import type { AimDirection, VolcanoEvent, VolcanoGame, VolcanoSnapshot } from '../domain/volcanoGame'

export const MAX_FRAME_SECONDS = 0.05

export class VolcanoSession {
  private readonly game: VolcanoGame
  private readonly held = new Set<AimDirection>()

  constructor(game: VolcanoGame) {
    this.game = game
  }

  snapshot(): VolcanoSnapshot {
    return this.game.snapshot()
  }

  hold(direction: AimDirection): void {
    this.held.add(direction)
  }

  release(direction: AimDirection): void {
    this.held.delete(direction)
  }

  toss(): void {
    this.game.toss()
  }

  togglePause(): void {
    this.game.togglePause()
  }

  advance(elapsedSeconds: number): VolcanoEvent[] {
    const dt = Math.min(elapsedSeconds, MAX_FRAME_SECONDS)
    if (this.held.size === 1) {
      const [direction] = this.held
      this.game.aim(direction, dt)
    }
    return this.game.tick(dt)
  }
}
