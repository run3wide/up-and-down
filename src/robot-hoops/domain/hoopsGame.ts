import { MAX_AIM, hoopAt, judgeShot, launchShot, stepShot, type Shot } from './shot'

export const SHOTS_PER_ROUND = 8
export const AIM_DEGREES_PER_SECOND = 30
export const BETWEEN_SHOTS = 1

export type Random = () => number
export type AimDirection = 'left' | 'right'
export type HoopsPhase = 'aiming' | 'flying' | 'between' | 'over'
export type HoopsEvent = { type: 'scored' } | { type: 'missed' } | { type: 'roundOver' }

export interface HoopsSnapshot {
  readonly phase: HoopsPhase
  readonly paused: boolean
  readonly aim: number
  readonly shot: Shot | null
  readonly hoopX: number
  readonly score: number
  readonly shotsLeft: number
}

export class HoopsGame {
  private readonly random: Random
  private phase: HoopsPhase = 'aiming'
  private paused = false
  private aimDegrees = 0
  private shot: Shot | null = null
  private hoopX: number
  private score = 0
  private shotsLeft = SHOTS_PER_ROUND
  private untilNextShot = 0

  constructor(random: Random) {
    this.random = random
    this.hoopX = this.pickHoop()
  }

  snapshot(): HoopsSnapshot {
    return {
      phase: this.phase,
      paused: this.paused,
      aim: this.aimDegrees,
      shot: this.shot,
      hoopX: this.hoopX,
      score: this.score,
      shotsLeft: this.shotsLeft,
    }
  }

  aim(direction: AimDirection, dt: number): void {
    if (!this.canAim()) return
    const sign = direction === 'left' ? -1 : 1
    this.aimDegrees = clamp(this.aimDegrees + sign * AIM_DEGREES_PER_SECOND * dt, -MAX_AIM, MAX_AIM)
  }

  shoot(): void {
    if (!this.canAim()) return
    this.phase = 'flying'
    this.shot = launchShot(this.aimDegrees)
    this.shotsLeft -= 1
  }

  togglePause(): void {
    if (this.phase !== 'over') this.paused = !this.paused
  }

  tick(dt: number): HoopsEvent[] {
    if (this.paused) return []
    if (this.phase === 'flying' && this.shot) return this.flyShot(this.shot, dt)
    if (this.phase === 'between') this.waitForNextShot(dt)
    return []
  }

  private canAim(): boolean {
    return this.phase === 'aiming' && !this.paused
  }

  private flyShot(shot: Shot, dt: number): HoopsEvent[] {
    const next = stepShot(shot, dt)
    const verdict = judgeShot(shot, next, this.hoopX)
    if (verdict === 'inFlight') {
      this.shot = next
      return []
    }
    return this.finishShot(verdict)
  }

  private finishShot(verdict: 'scored' | 'missed'): HoopsEvent[] {
    if (verdict === 'scored') this.score += 1
    const result: HoopsEvent = { type: verdict }
    if (this.shotsLeft > 0) {
      this.phase = 'between'
      this.untilNextShot = BETWEEN_SHOTS
      return [result]
    }
    this.phase = 'over'
    return [result, { type: 'roundOver' }]
  }

  private waitForNextShot(dt: number): void {
    this.untilNextShot -= dt
    if (this.untilNextShot > 0) return
    this.shot = null
    this.hoopX = this.pickHoop()
    this.phase = 'aiming'
  }

  /** Hoops are placed where a real shot lands, so there is always an angle that scores. */
  private pickHoop(): number {
    return hoopAt((this.random() * 2 - 1) * MAX_AIM)
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

