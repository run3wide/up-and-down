import { describe, expect, it } from 'vitest'
import { AIM_DEGREES_PER_SECOND, BETWEEN_SHOTS, HoopsGame, SHOTS_PER_ROUND, type HoopsEvent } from './hoopsGame'
import { MAX_AIM, hoopAt } from './shot'

const FRAME = 1 / 60

/** A random source whose first value picks the hoop's aim: 0.5 is straight ahead. */
const hoopAimedAt = (fraction: number) => () => fraction
const straightAhead = hoopAimedAt(0.5)

function runUntil(game: HoopsGame, done: () => boolean, limit = 60 * 60): HoopsEvent[] {
  const events: HoopsEvent[] = []
  for (let i = 0; i < limit && !done(); i++) events.push(...game.tick(FRAME))
  return events
}

function takeAShot(game: HoopsGame): HoopsEvent[] {
  game.shoot()
  return runUntil(game, () => game.snapshot().phase !== 'flying')
}

describe('a new round', () => {
  it('starts aiming straight ahead with all shots left and no score', () => {
    expect(new HoopsGame(straightAhead).snapshot()).toMatchObject({
      phase: 'aiming',
      aim: 0,
      score: 0,
      shotsLeft: SHOTS_PER_ROUND,
      shot: null,
    })
  })

  it('puts the first hoop where the random source says', () => {
    const left = new HoopsGame(hoopAimedAt(0)).snapshot().hoopX
    const right = new HoopsGame(hoopAimedAt(1)).snapshot().hoopX

    expect(left).toBeCloseTo(hoopAt(-MAX_AIM))
    expect(right).toBeCloseTo(hoopAt(MAX_AIM))
  })
})

describe('aiming', () => {
  it('turns left and right over time', () => {
    const game = new HoopsGame(straightAhead)

    game.aim('right', 0.1)
    expect(game.snapshot().aim).toBeCloseTo(AIM_DEGREES_PER_SECOND * 0.1)
    game.aim('left', 0.3)
    expect(game.snapshot().aim).toBeCloseTo(-AIM_DEGREES_PER_SECOND * 0.2)
  })

  it('stops at the widest angle', () => {
    const game = new HoopsGame(straightAhead)

    game.aim('right', 100)
    expect(game.snapshot().aim).toBe(MAX_AIM)
    game.aim('left', 100)
    expect(game.snapshot().aim).toBe(-MAX_AIM)
  })

  it('cannot be changed while the ball is in the air', () => {
    const game = new HoopsGame(straightAhead)
    game.shoot()

    game.aim('right', 1)

    expect(game.snapshot().aim).toBe(0)
  })
})

describe('shooting', () => {
  it('launches the ball and uses up a shot', () => {
    const game = new HoopsGame(straightAhead)

    game.shoot()

    expect(game.snapshot()).toMatchObject({ phase: 'flying', shotsLeft: SHOTS_PER_ROUND - 1 })
    expect(game.snapshot().shot).not.toBeNull()
  })

  it('ignores a second press while the ball is already flying', () => {
    const game = new HoopsGame(straightAhead)
    game.shoot()
    game.shoot()

    expect(game.snapshot().shotsLeft).toBe(SHOTS_PER_ROUND - 1)
  })

  it('scores when aimed at the hoop', () => {
    const game = new HoopsGame(straightAhead)

    const events = takeAShot(game)

    expect(events).toContainEqual({ type: 'scored' })
    expect(game.snapshot().score).toBe(1)
  })

  it('misses when aimed away from the hoop', () => {
    const game = new HoopsGame(hoopAimedAt(1))

    game.aim('left', 100)
    const events = takeAShot(game)

    expect(events).toContainEqual({ type: 'missed' })
    expect(game.snapshot().score).toBe(0)
  })
})

describe('between shots', () => {
  it('waits a moment, then moves the hoop and lets the player aim again', () => {
    const values = [0.5, 1]
    const game = new HoopsGame(() => values.shift() ?? 1)
    const firstHoop = game.snapshot().hoopX
    takeAShot(game)
    expect(game.snapshot().phase).toBe('between')

    game.tick(BETWEEN_SHOTS + FRAME)

    expect(game.snapshot().phase).toBe('aiming')
    expect(game.snapshot().hoopX).not.toBe(firstHoop)
    expect(game.snapshot().shot).toBeNull()
  })

  it('does not accept a shot until aiming again', () => {
    const game = new HoopsGame(straightAhead)
    takeAShot(game)

    game.shoot()

    expect(game.snapshot().shotsLeft).toBe(SHOTS_PER_ROUND - 1)
  })
})

describe('the end of the round', () => {
  function playWholeRound() {
    const game = new HoopsGame(straightAhead)
    const events: HoopsEvent[] = []
    while (game.snapshot().phase !== 'over') {
      if (game.snapshot().phase === 'aiming') game.shoot()
      events.push(...game.tick(FRAME))
    }
    return { game, events }
  }

  it('is over after the last shot, and says so once', () => {
    const { game, events } = playWholeRound()

    expect(game.snapshot().shotsLeft).toBe(0)
    expect(events.filter((e) => e.type === 'roundOver')).toHaveLength(1)
    expect(events.at(-1)).toEqual({ type: 'roundOver' })
  })

  it('scores every shot when aimed perfectly each time', () => {
    expect(playWholeRound().game.snapshot().score).toBe(SHOTS_PER_ROUND)
  })

  it('ignores everything once over', () => {
    const { game } = playWholeRound()
    const before = game.snapshot()

    game.shoot()
    game.aim('left', 1)
    game.tick(1)

    expect(game.snapshot()).toEqual(before)
  })
})

describe('pausing', () => {
  it('freezes the ball, aiming and shooting until resumed', () => {
    const game = new HoopsGame(straightAhead)
    game.shoot()
    game.tick(0.2)
    game.togglePause()
    const frozen = game.snapshot()

    game.tick(1)
    game.aim('left', 1)
    game.shoot()
    expect(game.snapshot()).toEqual({ ...frozen })
    expect(game.snapshot().paused).toBe(true)

    game.togglePause()
    game.tick(0.1)
    expect(game.snapshot().paused).toBe(false)
    expect(game.snapshot().shot).not.toEqual(frozen.shot)
  })
})
