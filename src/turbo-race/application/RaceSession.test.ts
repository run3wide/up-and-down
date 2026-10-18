import { describe, expect, it } from 'vitest'
import { COUNTDOWN_SECONDS, RaceGame } from '../domain/raceGame'
import { MAX_FRAME_SECONDS, RaceSession } from './RaceSession'

function racingSession() {
  const session = new RaceSession(new RaceGame([]))
  session.advance(MAX_FRAME_SECONDS)
  for (let i = 0; i < COUNTDOWN_SECONDS / MAX_FRAME_SECONDS + 2; i++) session.advance(MAX_FRAME_SECONDS)
  return session
}

describe('RaceSession', () => {
  it('steers while a direction is held and stops when released', () => {
    const session = racingSession()
    const start = session.snapshot().carX

    session.hold('right')
    session.advance(0.05)
    session.release('right')
    const steered = session.snapshot().carX
    session.advance(0.05)

    expect(steered).toBeGreaterThan(start)
    expect(session.snapshot().carX).toBe(steered)
  })

  it('goes straight when both directions are held', () => {
    const session = racingSession()
    const start = session.snapshot().carX

    session.hold('left')
    session.hold('right')
    session.advance(0.05)

    expect(session.snapshot().carX).toBe(start)
  })

  it('treats a very long frame as a short one', () => {
    const long = racingSession()
    const capped = racingSession()
    long.hold('right')
    capped.hold('right')

    long.advance(10)
    capped.advance(MAX_FRAME_SECONDS)

    expect(long.snapshot().carX).toBeCloseTo(capped.snapshot().carX)
    expect(long.snapshot().distance).toBeCloseTo(capped.snapshot().distance)
  })

  it('lets a finger place the car directly', () => {
    const session = racingSession()

    session.dragTo(35)

    expect(session.snapshot().carX).toBe(35)
  })

  it('does not steer while paused', () => {
    const session = racingSession()
    session.hold('left')
    session.togglePause()
    const before = session.snapshot().carX

    session.advance(0.05)

    expect(session.snapshot().carX).toBe(before)
  })
})
