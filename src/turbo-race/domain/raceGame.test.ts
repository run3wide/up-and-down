import { describe, expect, it } from 'vitest'
import type { CourseItem } from './course'
import { FINISH_DISTANCE } from './course'
import {
  COUNTDOWN_SECONDS,
  INVULNERABLE_SECONDS,
  MAX_LIVES,
  MAX_SPEED,
  RaceGame,
  START_SPEED,
  STEER_UNITS_PER_SECOND,
  type RaceEvent,
} from './raceGame'

const FRAME = 1 / 60
const CENTRE = 50

const cone = (id: number, at: number, x = CENTRE): CourseItem => ({ id, kind: 'cone', at, x })
const cookie = (id: number, at: number, x = CENTRE): CourseItem => ({ id, kind: 'cookie', at, x })

function racing(course: CourseItem[] = []): RaceGame {
  const game = new RaceGame(course)
  game.tick(COUNTDOWN_SECONDS + FRAME)
  return game
}

function driveUntil(game: RaceGame, done: () => boolean, limit = 60 * 120): RaceEvent[] {
  const events: RaceEvent[] = []
  for (let i = 0; i < limit && !done(); i++) events.push(...game.tick(FRAME))
  return events
}

describe('the start of a race', () => {
  it('begins with a countdown, parked in the middle of the road with full lives', () => {
    expect(new RaceGame([]).snapshot()).toMatchObject({
      phase: 'countdown',
      carX: CENTRE,
      distance: 0,
      lives: MAX_LIVES,
      cookies: 0,
    })
  })

  it('does not move the car forward until the countdown is over', () => {
    const game = new RaceGame([])

    game.tick(COUNTDOWN_SECONDS - 0.5)

    expect(game.snapshot().distance).toBe(0)
    expect(game.snapshot().phase).toBe('countdown')
  })

  it('counts down in whole seconds for the display', () => {
    const game = new RaceGame([])

    expect(game.snapshot().countdown).toBe(COUNTDOWN_SECONDS)
    game.tick(1.2)
    expect(game.snapshot().countdown).toBe(COUNTDOWN_SECONDS - 1)
  })

  it('goes once the countdown ends', () => {
    expect(racing().snapshot().phase).toBe('racing')
  })
})

describe('driving', () => {
  it('speeds up gently, but never past the top speed', () => {
    const game = racing()
    driveUntil(game, () => false, 60 * 3)
    const early = game.snapshot().speed
    driveUntil(game, () => false, 60 * 60)

    expect(early).toBeGreaterThan(START_SPEED)
    expect(game.snapshot().speed).toBe(MAX_SPEED)
  })

  it('covers more ground the longer it drives', () => {
    const game = racing()

    game.tick(0.5)
    const first = game.snapshot().distance
    game.tick(0.5)

    expect(first).toBeGreaterThan(0)
    expect(game.snapshot().distance).toBeGreaterThan(first)
  })
})

describe('steering', () => {
  it('steers left and right over time', () => {
    const game = racing()

    game.steer('right', 0.1)
    expect(game.snapshot().carX).toBeCloseTo(CENTRE + STEER_UNITS_PER_SECOND * 0.1)
    game.steer('left', 0.3)
    expect(game.snapshot().carX).toBeCloseTo(CENTRE - STEER_UNITS_PER_SECOND * 0.2)
  })

  it('can steer during the countdown', () => {
    const game = new RaceGame([])

    game.steer('left', 0.1)

    expect(game.snapshot().carX).toBeLessThan(CENTRE)
  })

  it('stays on the road', () => {
    const game = racing()

    game.steer('left', 100)
    const leftmost = game.snapshot().carX
    game.steer('right', 100)

    expect(leftmost).toBeGreaterThan(20)
    expect(game.snapshot().carX).toBeLessThan(80)
  })

  it('can be placed directly, for touch dragging, and is kept on the road', () => {
    const game = racing()

    game.placeCar(35)
    expect(game.snapshot().carX).toBe(35)
    game.placeCar(1000)
    expect(game.snapshot().carX).toBeLessThan(80)
  })
})

describe('cookies', () => {
  it('scores a cookie driven through', () => {
    const game = racing([cookie(1, 30)])

    const events = driveUntil(game, () => game.snapshot().distance > 40)

    expect(events).toContainEqual({ type: 'cookieCollected' })
    expect(game.snapshot().cookies).toBe(1)
  })

  it('misses a cookie that is off to the side', () => {
    const game = racing([cookie(1, 30, 30)])

    driveUntil(game, () => game.snapshot().distance > 40)

    expect(game.snapshot().cookies).toBe(0)
  })

  it('takes a cookie only once, and removes it from the road', () => {
    const game = racing([cookie(1, 30)])

    driveUntil(game, () => game.snapshot().cookies > 0)

    expect(game.snapshot().items.some((item) => item.kind === 'cookie')).toBe(false)
  })
})

describe('crashing', () => {
  it('loses a life, slows right down and reports the crash', () => {
    const game = racing([cone(1, 400)])
    driveUntil(game, () => game.snapshot().speed > START_SPEED + 8)

    const events = driveUntil(game, () => game.snapshot().lives < MAX_LIVES)

    expect(events).toContainEqual({ type: 'crashed' })
    expect(game.snapshot().speed).toBe(START_SPEED)
  })

  it('is not hurt again straight away, so one cone costs one life', () => {
    const game = racing([cone(1, 40)])

    driveUntil(game, () => game.snapshot().distance > 60)

    expect(game.snapshot().lives).toBe(MAX_LIVES - 1)
  })

  it('flashes as untouchable for a moment after a crash', () => {
    const game = racing([cone(1, 40)])

    driveUntil(game, () => game.snapshot().lives < MAX_LIVES)
    expect(game.snapshot().invulnerable).toBe(true)
    driveUntil(game, () => !game.snapshot().invulnerable, 60 * (INVULNERABLE_SECONDS + 1))

    expect(game.snapshot().invulnerable).toBe(false)
  })

  it('drives past a cone untouched when steering around it', () => {
    const game = racing([cone(1, 40, 70)])
    game.placeCar(30)

    driveUntil(game, () => game.snapshot().distance > 60)

    expect(game.snapshot().lives).toBe(MAX_LIVES)
  })

  it('is over after the last life is lost', () => {
    const cones = [cone(1, 40), cone(2, 140), cone(3, 240)]
    const game = racing(cones)

    const events = driveUntil(game, () => game.snapshot().phase === 'over')

    expect(game.snapshot().lives).toBe(0)
    expect(events.at(-1)).toEqual({ type: 'gameOver' })
  })
})

describe('the finish line', () => {
  it('ends the race with a finish when the car crosses it', () => {
    const game = racing()

    const events = driveUntil(game, () => game.snapshot().phase !== 'racing')

    expect(game.snapshot()).toMatchObject({ phase: 'finished' })
    expect(game.snapshot().distance).toBeGreaterThanOrEqual(FINISH_DISTANCE)
    expect(events.at(-1)).toEqual({ type: 'finished' })
  })

  it('ignores everything once the race is done', () => {
    const game = racing()
    driveUntil(game, () => game.snapshot().phase !== 'racing')
    const before = game.snapshot()

    game.tick(1)
    game.steer('left', 1)
    game.placeCar(30)

    expect(game.snapshot()).toEqual(before)
  })
})

describe('what the player can see', () => {
  it('lists only the items near the car, with how far ahead each one is', () => {
    const game = racing([cone(1, 30), cone(2, 5000)])

    game.tick(0.2)
    const items = game.snapshot().items

    expect(items.map((item) => item.id)).toEqual([1])
    expect(items[0].ahead).toBeCloseTo(30 - game.snapshot().distance)
  })
})

describe('pausing', () => {
  it('freezes the race until resumed', () => {
    const game = racing()
    game.tick(0.2)
    game.togglePause()
    const frozen = game.snapshot()

    game.tick(1)
    game.steer('left', 1)
    expect(game.snapshot()).toEqual({ ...frozen })
    expect(game.snapshot().paused).toBe(true)

    game.togglePause()
    game.tick(0.1)
    expect(game.snapshot().distance).toBeGreaterThan(frozen.distance)
  })

  it('cannot pause once the race is done', () => {
    const game = racing()
    driveUntil(game, () => game.snapshot().phase !== 'racing')

    game.togglePause()

    expect(game.snapshot().paused).toBe(false)
  })
})
