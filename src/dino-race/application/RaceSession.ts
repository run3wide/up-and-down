import type { RaceEvent, RaceGame, RaceSnapshot, SteerDirection } from '../domain/raceGame'

export const MAX_FRAME_SECONDS = 0.05

export class RaceSession {
  private readonly game: RaceGame
  private readonly held = new Set<SteerDirection>()

  constructor(game: RaceGame) {
    this.game = game
  }

  snapshot(): RaceSnapshot {
    return this.game.snapshot()
  }

  hold(direction: SteerDirection): void {
    this.held.add(direction)
  }

  release(direction: SteerDirection): void {
    this.held.delete(direction)
  }

  dragTo(x: number): void {
    this.game.placeCar(x)
  }

  answer(optionIndex: number): RaceEvent[] {
    return this.game.answer(optionIndex)
  }

  togglePause(): void {
    this.game.togglePause()
  }

  advance(elapsedSeconds: number): RaceEvent[] {
    const dt = Math.min(elapsedSeconds, MAX_FRAME_SECONDS)
    if (this.held.size === 1) {
      const [direction] = this.held
      this.game.steer(direction, dt)
    }
    return this.game.tick(dt)
  }
}
