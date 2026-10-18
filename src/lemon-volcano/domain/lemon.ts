/** World is 100 wide; y is height above the ground. The strawberry stands at the bottom centre. */
export const STRAWBERRY_X = 50
export const LAUNCH_Y = 12
export const CRATER_Y = 50
export const CRATER_HALF_WIDTH = 7
/** Aim is degrees from straight up; negative leans left. */
export const MAX_AIM = 18

const GRAVITY = 100
const THROW_SPEED = 100

export interface Lemon {
  readonly x: number
  readonly y: number
  readonly vx: number
  readonly vy: number
}

export type LemonVerdict = 'inFlight' | 'scored' | 'missed'

export function throwLemon(aimDegrees: number): Lemon {
  const radians = (aimDegrees * Math.PI) / 180
  return { x: STRAWBERRY_X, y: LAUNCH_Y, vx: THROW_SPEED * Math.sin(radians), vy: THROW_SPEED * Math.cos(radians) }
}

export function stepLemon(lemon: Lemon, dt: number): Lemon {
  return {
    x: lemon.x + lemon.vx * dt,
    y: lemon.y + lemon.vy * dt - 0.5 * GRAVITY * dt * dt,
    vx: lemon.vx,
    vy: lemon.vy - GRAVITY * dt,
  }
}

/** Where a lemon launched at this aim comes down through crater height, so every crater can be scored. */
export function craterAt(aimDegrees: number): number {
  const { vx, vy } = throwLemon(aimDegrees)
  const rise = CRATER_Y - LAUNCH_Y
  const secondsToComeDown = (vy + Math.sqrt(vy * vy - 2 * GRAVITY * rise)) / GRAVITY
  return STRAWBERRY_X + vx * secondsToComeDown
}

export function judgeLemon(before: Lemon, after: Lemon, craterX: number): LemonVerdict {
  if (before.y > CRATER_Y && after.y <= CRATER_Y && after.vy < 0) {
    const crossing = (before.y - CRATER_Y) / (before.y - after.y)
    const x = before.x + (after.x - before.x) * crossing
    return Math.abs(x - craterX) <= CRATER_HALF_WIDTH ? 'scored' : 'inFlight'
  }
  return after.y <= 0 ? 'missed' : 'inFlight'
}
