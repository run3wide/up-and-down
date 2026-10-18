import { describe, expect, it } from 'vitest'
import { Game } from '../domain/game'
import { MAX_FRAME_SECONDS, GameSession } from './GameSession'

function newSession() {
  return new GameSession(new Game(() => 0.5))
}

describe('GameSession', () => {
  it('moves the dinosaur while a direction is held', () => {
    const session = newSession()
    const start = session.snapshot().dinoX

    session.hold('right')
    session.advance(0.1)

    expect(session.snapshot().dinoX).toBeGreaterThan(start)
  })

  it('stops moving once the direction is released', () => {
    const session = newSession()
    session.hold('right')
    session.advance(0.1)
    session.release('right')
    const stopped = session.snapshot().dinoX

    session.advance(0.1)

    expect(session.snapshot().dinoX).toBe(stopped)
  })

  it('stands still when both directions are held', () => {
    const session = newSession()
    const start = session.snapshot().dinoX

    session.hold('left')
    session.hold('right')
    session.advance(0.1)

    expect(session.snapshot().dinoX).toBe(start)
  })

  it('treats a long frame, such as after switching tabs, as a short one', () => {
    const session = newSession()
    const start = session.snapshot().dinoX
    session.hold('right')

    session.advance(10)

    const travelled = session.snapshot().dinoX - start
    const oneCappedFrame = newSession()
    oneCappedFrame.hold('right')
    oneCappedFrame.advance(MAX_FRAME_SECONDS)
    expect(travelled).toBeCloseTo(oneCappedFrame.snapshot().dinoX - start)
  })

  it('lets a pointer place the dinosaur directly', () => {
    const session = newSession()

    session.dragTo(25)

    expect(session.snapshot().dinoX).toBe(25)
  })

  it('does not keep moving after being paused and resumed with a key still released', () => {
    const session = newSession()
    session.hold('left')
    session.togglePause()
    session.release('left')
    session.togglePause()
    const before = session.snapshot().dinoX

    session.advance(0.1)

    expect(session.snapshot().dinoX).toBe(before)
  })

  it('passes game events through from advancing', () => {
    const session = newSession()
    session.dragTo(0)

    const events = []
    for (let i = 0; i < 60 * 10; i++) events.push(...session.advance(1 / 60))

    expect(events).toContainEqual({ type: 'missed' })
  })
})
