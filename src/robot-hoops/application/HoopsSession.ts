import type { AimDirection, HoopsEvent, HoopsGame, HoopsSnapshot } from '../domain/hoopsGame'

export const MAX_FRAME_SECONDS = 0.05

export class HoopsSession {
  private readonly game: HoopsGame
  private readonly held = new Set<AimDirection>()

  constructor(game: HoopsGame) {
    this.game = game
  }

  snapshot(): HoopsSnapshot {
    return this.game.snapshot()
  }

  hold(direction: AimDirection): void {
    this.held.add(direction)
  }

  release(direction: AimDirection): void {
    this.held.delete(direction)
  }

  shoot(): void {
    this.game.shoot()
  }

  togglePause(): void {
    this.game.togglePause()
  }

  advance(elapsedSeconds: number): HoopsEvent[] {
    const dt = Math.min(elapsedSeconds, MAX_FRAME_SECONDS)
    if (this.held.size === 1) {
      const [direction] = this.held
      this.game.aim(direction, dt)
    }
    return this.game.tick(dt)
  }
}
