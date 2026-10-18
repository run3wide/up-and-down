import { describe, expect, it } from 'vitest'
import type { Ball } from './ball'
import { DINO_HEIGHT, DINO_WIDTH, BALL_RADIUS, judgeBall } from './catching'

const falling = (x: number, y: number): Ball => ({ x, y, vx: 0, vy: -30 })
const rising = (x: number, y: number): Ball => ({ x, y, vx: 0, vy: 30 })

describe('judging the ball against the dinosaur', () => {
  it('is still in play while the ball is high above the dinosaur', () => {
    expect(judgeBall(falling(50, 80), 50)).toBe('inPlay')
  })

  it('is caught when the falling ball reaches the dinosaur directly above it', () => {
    expect(judgeBall(falling(50, DINO_HEIGHT), 50)).toBe('caught')
  })

  it('is caught at the edge of the dinosaur, counting the ball radius', () => {
    const edge = 50 + DINO_WIDTH / 2 + BALL_RADIUS - 0.01

    expect(judgeBall(falling(edge, DINO_HEIGHT), 50)).toBe('caught')
  })

  it('is missed when the ball hits the ground away from the dinosaur', () => {
    expect(judgeBall(falling(10, 0), 80)).toBe('missed')
  })

  it('is not caught just outside the dinosaur width', () => {
    const outside = 50 + DINO_WIDTH / 2 + BALL_RADIUS + 0.01

    expect(judgeBall(falling(outside, DINO_HEIGHT), 50)).toBe('inPlay')
  })

  it('cannot be caught while still rising through the dinosaur', () => {
    expect(judgeBall(rising(50, 1), 50)).toBe('inPlay')
  })
})
