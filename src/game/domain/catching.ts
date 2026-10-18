import type { Ball } from './ball'

export const DINO_WIDTH = 16
export const DINO_HEIGHT = 12
export const BALL_RADIUS = 3

export type Verdict = 'inPlay' | 'caught' | 'missed'

export function judgeBall(ball: Ball, dinoX: number): Verdict {
  if (ball.vy >= 0) return 'inPlay'
  if (ball.y <= 0) return 'missed'
  if (ball.y <= DINO_HEIGHT && isOverDino(ball.x, dinoX)) return 'caught'
  return 'inPlay'
}

function isOverDino(ballX: number, dinoX: number): boolean {
  return Math.abs(ballX - dinoX) <= DINO_WIDTH / 2 + BALL_RADIUS
}
