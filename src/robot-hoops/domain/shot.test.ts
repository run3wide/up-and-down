import { describe, expect, it } from 'vitest'
import { HOOP_HALF_WIDTH, MAX_AIM, hoopAt, judgeShot, launchShot, stepShot, type Shot } from './shot'

function fly(aim: number, hoopX: number): 'scored' | 'missed' {
  let shot = launchShot(aim)
  for (let i = 0; i < 60 * 20; i++) {
    const next = stepShot(shot, 1 / 120)
    const verdict = judgeShot(shot, next, hoopX)
    if (verdict !== 'inFlight') return verdict
    shot = next
  }
  throw new Error('shot never landed')
}

describe('launching a shot', () => {
  it('goes straight up when aimed straight ahead', () => {
    const shot = launchShot(0)

    expect(shot.vx).toBeCloseTo(0)
    expect(shot.vy).toBeGreaterThan(0)
  })

  it('leans right for a positive aim and left for a negative one', () => {
    expect(launchShot(10).vx).toBeGreaterThan(0)
    expect(launchShot(-10).vx).toBeLessThan(0)
  })

  it('always launches with the same power, whatever the angle', () => {
    const speed = (s: Shot) => Math.hypot(s.vx, s.vy)

    expect(speed(launchShot(-12))).toBeCloseTo(speed(launchShot(7)))
  })
})

describe('the hoop', () => {
  it.each([-MAX_AIM, -9, -2, 0, 5, 13, MAX_AIM])('can be scored by aiming at %d degrees', (aim) => {
    expect(fly(aim, hoopAt(aim))).toBe('scored')
  })

  it('sits on the side the aim leans towards', () => {
    expect(hoopAt(-10)).toBeLessThan(hoopAt(0))
    expect(hoopAt(10)).toBeGreaterThan(hoopAt(0))
  })

  it('stays inside the screen even at the widest aim', () => {
    expect(hoopAt(MAX_AIM) + HOOP_HALF_WIDTH).toBeLessThanOrEqual(100)
    expect(hoopAt(-MAX_AIM) - HOOP_HALF_WIDTH).toBeGreaterThanOrEqual(0)
  })
})

describe('judging a shot', () => {
  it('misses when the ball comes down clear of the hoop', () => {
    expect(fly(-15, hoopAt(15))).toBe('missed')
  })

  it('does not score while the ball is still rising through the hoop', () => {
    const rising: Shot = { x: 50, y: 49, vx: 0, vy: 50 }

    expect(judgeShot(rising, stepShot(rising, 0.05), 50)).toBe('inFlight')
  })

  it('is forgiving: scores when slightly off-centre but within the hoop', () => {
    const hoopX = hoopAt(0) + HOOP_HALF_WIDTH - 1

    expect(fly(0, hoopX)).toBe('scored')
  })
})
