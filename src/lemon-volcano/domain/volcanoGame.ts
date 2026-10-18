import { MAX_AIM, craterAt, judgeLemon, throwLemon, stepLemon, type Lemon } from './lemon'

export const LEMONS_PER_ROUND = 8
export const AIM_DEGREES_PER_SECOND = 30
export const BETWEEN_THROWS = 1

export type Random = () => number
export type AimDirection = 'left' | 'right'
export type VolcanoPhase = 'aiming' | 'flying' | 'between' | 'over'
export type VolcanoEvent = { type: 'scored' } | { type: 'missed' } | { type: 'roundOver' }

export interface VolcanoSnapshot {
  readonly phase: VolcanoPhase
  readonly paused: boolean
  readonly aim: number
  readonly lemon: Lemon | null
  readonly craterX: number
  readonly score: number
  readonly lemonsLeft: number
}

export class VolcanoGame {
  private readonly random: Random
  private phase: VolcanoPhase = 'aiming'
  private paused = false
  private aimDegrees = 0
  private lemon: Lemon | null = null
  private craterX: number
  private score = 0
  private lemonsLeft = LEMONS_PER_ROUND
  private untilNextLemon = 0

  constructor(random: Random) {
    this.random = random
    this.craterX = this.pickCrater()
  }

  snapshot(): VolcanoSnapshot {
    return {
      phase: this.phase,
      paused: this.paused,
      aim: this.aimDegrees,
      lemon: this.lemon,
      craterX: this.craterX,
      score: this.score,
      lemonsLeft: this.lemonsLeft,
    }
  }

  aim(direction: AimDirection, dt: number): void {
    if (!this.canAim()) return
    const sign = direction === 'left' ? -1 : 1
    this.aimDegrees = clamp(this.aimDegrees + sign * AIM_DEGREES_PER_SECOND * dt, -MAX_AIM, MAX_AIM)
  }

  toss(): void {
    if (!this.canAim()) return
    this.phase = 'flying'
    this.lemon = throwLemon(this.aimDegrees)
    this.lemonsLeft -= 1
  }

  togglePause(): void {
    if (this.phase !== 'over') this.paused = !this.paused
  }

  tick(dt: number): VolcanoEvent[] {
    if (this.paused) return []
    if (this.phase === 'flying' && this.lemon) return this.flyLemon(this.lemon, dt)
    if (this.phase === 'between') this.waitForNextLemon(dt)
    return []
  }

  private canAim(): boolean {
    return this.phase === 'aiming' && !this.paused
  }

  private flyLemon(lemon: Lemon, dt: number): VolcanoEvent[] {
    const next = stepLemon(lemon, dt)
    const verdict = judgeLemon(lemon, next, this.craterX)
    if (verdict === 'inFlight') {
      this.lemon = next
      return []
    }
    return this.finishLemon(verdict)
  }

  private finishLemon(verdict: 'scored' | 'missed'): VolcanoEvent[] {
    if (verdict === 'scored') this.score += 1
    const result: VolcanoEvent = { type: verdict }
    if (this.lemonsLeft > 0) {
      this.phase = 'between'
      this.untilNextLemon = BETWEEN_THROWS
      return [result]
    }
    this.phase = 'over'
    return [result, { type: 'roundOver' }]
  }

  private waitForNextLemon(dt: number): void {
    this.untilNextLemon -= dt
    if (this.untilNextLemon > 0) return
    this.lemon = null
    this.craterX = this.pickCrater()
    this.phase = 'aiming'
  }

  /** Volcano are placed where a real lemon lands, so there is always an angle that scores. */
  private pickCrater(): number {
    return craterAt((this.random() * 2 - 1) * MAX_AIM)
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

