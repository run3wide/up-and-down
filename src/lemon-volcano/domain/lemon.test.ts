import { describe, expect, it } from 'vitest'
import { CRATER_HALF_WIDTH, MAX_AIM, craterAt, judgeLemon, throwLemon, stepLemon, type Lemon } from './lemon'

function fly(aim: number, craterX: number): 'scored' | 'missed' {
  let lemon = throwLemon(aim)
  for (let i = 0; i < 60 * 20; i++) {
    const next = stepLemon(lemon, 1 / 120)
    const verdict = judgeLemon(lemon, next, craterX)
    if (verdict !== 'inFlight') return verdict
    lemon = next
  }
  throw new Error('lemon never landed')
}

describe('launching a lemon', () => {
  it('goes straight up when aimed straight ahead', () => {
    const lemon = throwLemon(0)

    expect(lemon.vx).toBeCloseTo(0)
    expect(lemon.vy).toBeGreaterThan(0)
  })

  it('leans right for a positive aim and left for a negative one', () => {
    expect(throwLemon(10).vx).toBeGreaterThan(0)
    expect(throwLemon(-10).vx).toBeLessThan(0)
  })

  it('always launches with the same power, whatever the angle', () => {
    const speed = (s: Lemon) => Math.hypot(s.vx, s.vy)

    expect(speed(throwLemon(-12))).toBeCloseTo(speed(throwLemon(7)))
  })
})

describe('the crater', () => {
  it.each([-MAX_AIM, -9, -2, 0, 5, 13, MAX_AIM])('can be scored by aiming at %d degrees', (aim) => {
    expect(fly(aim, craterAt(aim))).toBe('scored')
  })

  it('sits on the side the aim leans towards', () => {
    expect(craterAt(-10)).toBeLessThan(craterAt(0))
    expect(craterAt(10)).toBeGreaterThan(craterAt(0))
  })

  it('stays inside the screen even at the widest aim', () => {
    expect(craterAt(MAX_AIM) + CRATER_HALF_WIDTH).toBeLessThanOrEqual(100)
    expect(craterAt(-MAX_AIM) - CRATER_HALF_WIDTH).toBeGreaterThanOrEqual(0)
  })
})

describe('judging a lemon', () => {
  it('misses when the lemon comes down clear of the crater', () => {
    expect(fly(-15, craterAt(15))).toBe('missed')
  })

  it('does not score while the lemon is still rising through the crater', () => {
    const rising: Lemon = { x: 50, y: 49, vx: 0, vy: 50 }

    expect(judgeLemon(rising, stepLemon(rising, 0.05), 50)).toBe('inFlight')
  })

  it('is forgiving: scores when slightly off-centre but within the crater', () => {
    const craterX = craterAt(0) + CRATER_HALF_WIDTH - 1

    expect(fly(0, craterX)).toBe('scored')
  })
})
