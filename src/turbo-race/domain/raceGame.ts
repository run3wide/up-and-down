import { FINISH_DISTANCE, type CourseItem, type ItemKind } from './course'

export const COUNTDOWN_SECONDS = 3
export const MAX_LIVES = 3
export const START_SPEED = 40
export const MAX_SPEED = 70
export const STEER_UNITS_PER_SECOND = 60
export const INVULNERABLE_SECONDS = 1.5

const ACCELERATION = 1.2
const CAR_MIN_X = 27
const CAR_MAX_X = 73
const CAR_HALF_WIDTH = 5
const ITEM_HALF_WIDTH = 3
const CONTACT_DEPTH = 5
const VISIBLE_BEHIND = 15
const VISIBLE_AHEAD = 100

export type Phase = 'countdown' | 'racing' | 'finished' | 'over'
export type SteerDirection = 'left' | 'right'
export type RaceEvent = { type: 'coinCollected' } | { type: 'crashed' } | { type: 'finished' } | { type: 'gameOver' }

export interface VisibleItem {
  readonly id: number
  readonly kind: ItemKind
  readonly x: number
  /** How far in front of the car this is; negative once it is behind. */
  readonly ahead: number
}

export interface RaceSnapshot {
  readonly phase: Phase
  readonly paused: boolean
  /** Whole seconds left on the start countdown, or 0 once racing. */
  readonly countdown: number
  readonly carX: number
  readonly distance: number
  readonly speed: number
  readonly lives: number
  readonly coins: number
  readonly invulnerable: boolean
  readonly items: readonly VisibleItem[]
}

export class RaceGame {
  private readonly course: readonly CourseItem[]
  private readonly used = new Set<number>()
  private phase: Phase = 'countdown'
  private paused = false
  private countdownLeft = COUNTDOWN_SECONDS
  private carX = 50
  private distance = 0
  private speed = START_SPEED
  private lives = MAX_LIVES
  private coins = 0
  private invulnerableLeft = 0

  constructor(course: readonly CourseItem[]) {
    this.course = course
  }

  snapshot(): RaceSnapshot {
    return {
      phase: this.phase,
      paused: this.paused,
      countdown: this.phase === 'countdown' ? Math.ceil(this.countdownLeft) : 0,
      carX: this.carX,
      distance: this.distance,
      speed: this.speed,
      lives: this.lives,
      coins: this.coins,
      invulnerable: this.invulnerableLeft > 0,
      items: this.visibleItems(),
    }
  }

  steer(direction: SteerDirection, dt: number): void {
    const sign = direction === 'left' ? -1 : 1
    this.placeCar(this.carX + sign * STEER_UNITS_PER_SECOND * dt)
  }

  placeCar(x: number): void {
    if (!this.isActive() || this.paused) return
    this.carX = Math.min(Math.max(x, CAR_MIN_X), CAR_MAX_X)
  }

  togglePause(): void {
    if (this.isActive()) this.paused = !this.paused
  }

  tick(dt: number): RaceEvent[] {
    if (this.paused) return []
    if (this.phase === 'countdown') return this.runCountdown(dt)
    if (this.phase === 'racing') return this.drive(dt)
    return []
  }

  private isActive(): boolean {
    return this.phase === 'countdown' || this.phase === 'racing'
  }

  private runCountdown(dt: number): RaceEvent[] {
    this.countdownLeft -= dt
    if (this.countdownLeft <= 0) this.phase = 'racing'
    return []
  }

  private drive(dt: number): RaceEvent[] {
    this.speed = Math.min(this.speed + ACCELERATION * dt, MAX_SPEED)
    this.distance += this.speed * dt
    this.invulnerableLeft = Math.max(this.invulnerableLeft - dt, 0)

    const events = this.touchItems()
    if (this.phase === 'over') return events
    if (this.distance >= FINISH_DISTANCE) {
      this.phase = 'finished'
      events.push({ type: 'finished' })
    }
    return events
  }

  private touchItems(): RaceEvent[] {
    const events: RaceEvent[] = []
    for (const item of this.course) {
      if (this.used.has(item.id) || !this.isTouching(item)) continue
      this.used.add(item.id)
      events.push(...(item.kind === 'coin' ? this.collectCoin() : this.hitObstacle()))
      if (this.phase === 'over') break
    }
    return events
  }

  private isTouching(item: CourseItem): boolean {
    return (
      Math.abs(item.at - this.distance) <= CONTACT_DEPTH && Math.abs(item.x - this.carX) < CAR_HALF_WIDTH + ITEM_HALF_WIDTH
    )
  }

  private collectCoin(): RaceEvent[] {
    this.coins += 1
    return [{ type: 'coinCollected' }]
  }

  private hitObstacle(): RaceEvent[] {
    if (this.invulnerableLeft > 0) return []
    this.lives -= 1
    this.speed = START_SPEED
    this.invulnerableLeft = INVULNERABLE_SECONDS
    if (this.lives > 0) return [{ type: 'crashed' }]
    this.phase = 'over'
    return [{ type: 'crashed' }, { type: 'gameOver' }]
  }

  private visibleItems(): VisibleItem[] {
    return this.course
      .filter((item) => !this.used.has(item.id))
      .map((item) => ({ id: item.id, kind: item.kind, x: item.x, ahead: item.at - this.distance }))
      .filter((item) => item.ahead >= -VISIBLE_BEHIND && item.ahead <= VISIBLE_AHEAD)
  }
}
