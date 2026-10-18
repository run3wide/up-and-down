import { describe, expect, it } from 'vitest'
import { GRAVITY, launchBall, stepBall } from './ball'

describe('ball physics', () => {
  it('rises while moving upward', () => {
    const ball = launchBall({ x: 50, vx: 0, vy: 40 })

    const later = stepBall(ball, 0.1)

    expect(later.y).toBeGreaterThan(ball.y)
  })

  it('slows down at the top because of gravity', () => {
    const ball = launchBall({ x: 50, vx: 0, vy: 40 })

    const later = stepBall(ball, 0.1)

    expect(later.vy).toBeCloseTo(40 - GRAVITY * 0.1)
  })

  it('turns around at the top and falls back down', () => {
    let ball = launchBall({ x: 50, vx: 0, vy: 40 })
    let peak = ball.y

    for (let i = 0; i < 200; i++) {
      ball = stepBall(ball, 0.01)
      peak = Math.max(peak, ball.y)
    }

    expect(ball.vy).toBeLessThan(0)
    expect(ball.y).toBeLessThan(peak)
  })

  it('drifts sideways at its horizontal speed', () => {
    const ball = launchBall({ x: 50, vx: 10, vy: 40 })

    expect(stepBall(ball, 0.5).x).toBeCloseTo(55)
  })

  it('bounces off the side walls instead of leaving the world', () => {
    const ball = launchBall({ x: 99, vx: 20, vy: 40 })

    const later = stepBall(ball, 0.2)

    expect(later.x).toBeLessThanOrEqual(100)
    expect(later.vx).toBeLessThan(0)
  })

  it('does not mutate the ball it is given', () => {
    const ball = launchBall({ x: 50, vx: 0, vy: 40 })

    stepBall(ball, 0.1)

    expect(ball.y).toBe(0)
  })
})
