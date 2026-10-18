/** World is 100 wide; y is height above the ground. The robot stands at the bottom centre. */
export const ROBOT_X = 50
export const LAUNCH_Y = 12
export const HOOP_Y = 50
export const HOOP_HALF_WIDTH = 7
/** Aim is degrees from straight up; negative leans left. */
export const MAX_AIM = 18

const GRAVITY = 100
const SHOT_SPEED = 100

export interface Shot {
  readonly x: number
  readonly y: number
  readonly vx: number
  readonly vy: number
}

export type ShotVerdict = 'inFlight' | 'scored' | 'missed'

export function launchShot(aimDegrees: number): Shot {
  const radians = (aimDegrees * Math.PI) / 180
  return { x: ROBOT_X, y: LAUNCH_Y, vx: SHOT_SPEED * Math.sin(radians), vy: SHOT_SPEED * Math.cos(radians) }
}

export function stepShot(shot: Shot, dt: number): Shot {
  return {
    x: shot.x + shot.vx * dt,
    y: shot.y + shot.vy * dt - 0.5 * GRAVITY * dt * dt,
    vx: shot.vx,
    vy: shot.vy - GRAVITY * dt,
  }
}

/** Where a shot launched at this aim comes down through hoop height, so every hoop can be scored. */
export function hoopAt(aimDegrees: number): number {
  const { vx, vy } = launchShot(aimDegrees)
  const rise = HOOP_Y - LAUNCH_Y
  const secondsToComeDown = (vy + Math.sqrt(vy * vy - 2 * GRAVITY * rise)) / GRAVITY
  return ROBOT_X + vx * secondsToComeDown
}

export function judgeShot(before: Shot, after: Shot, hoopX: number): ShotVerdict {
  if (before.y > HOOP_Y && after.y <= HOOP_Y && after.vy < 0) {
    const crossing = (before.y - HOOP_Y) / (before.y - after.y)
    const x = before.x + (after.x - before.x) * crossing
    return Math.abs(x - hoopX) <= HOOP_HALF_WIDTH ? 'scored' : 'inFlight'
  }
  return after.y <= 0 ? 'missed' : 'inFlight'
}
