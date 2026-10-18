import { WORLD_WIDTH } from './world'

export const GRAVITY = 60

export interface Ball {
  readonly x: number
  readonly y: number
  readonly vx: number
  readonly vy: number
}

export function launchBall({ x, vx, vy }: { x: number; vx: number; vy: number }): Ball {
  return { x, y: 0, vx, vy }
}

export function stepBall(ball: Ball, dt: number): Ball {
  const vy = ball.vy - GRAVITY * dt
  const y = ball.y + ball.vy * dt - 0.5 * GRAVITY * dt * dt
  return bounceOffWalls({ x: ball.x + ball.vx * dt, y, vx: ball.vx, vy })
}

function bounceOffWalls(ball: Ball): Ball {
  if (ball.x < 0) return { ...ball, x: -ball.x, vx: -ball.vx }
  if (ball.x > WORLD_WIDTH) return { ...ball, x: 2 * WORLD_WIDTH - ball.x, vx: -ball.vx }
  return ball
}
