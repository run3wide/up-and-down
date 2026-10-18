import { describe, expect, it } from 'vitest'
import { HoopsGame } from '../domain/hoopsGame'
import { HoopsSession, MAX_FRAME_SECONDS } from './HoopsSession'

const newSession = () => new HoopsSession(new HoopsGame(() => 0.5))

describe('HoopsSession', () => {
  it('aims while a direction is held and stops when released', () => {
    const session = newSession()

    session.hold('right')
    session.advance(0.1)
    session.release('right')
    const aimed = session.snapshot().aim
    session.advance(0.1)

    expect(aimed).toBeGreaterThan(0)
    expect(session.snapshot().aim).toBe(aimed)
  })

  it('stays put when both directions are held', () => {
    const session = newSession()

    session.hold('left')
    session.hold('right')
    session.advance(0.1)

    expect(session.snapshot().aim).toBe(0)
  })

  it('treats a very long frame as a short one', () => {
    const long = newSession()
    const capped = newSession()
    long.hold('right')
    capped.hold('right')

    long.advance(10)
    capped.advance(MAX_FRAME_SECONDS)

    expect(long.snapshot().aim).toBeCloseTo(capped.snapshot().aim)
  })

  it('shoots and reports the result as events', () => {
    const session = newSession()
    session.shoot()

    const events = []
    for (let i = 0; i < 60 * 5; i++) events.push(...session.advance(1 / 60))

    expect(events).toContainEqual({ type: 'scored' })
  })

  it('does not aim while paused', () => {
    const session = newSession()
    session.hold('right')
    session.togglePause()

    session.advance(0.1)

    expect(session.snapshot().aim).toBe(0)
  })
})
