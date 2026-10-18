import { describe, expect, it } from 'vitest'
import { AIM_DEGREES_PER_SECOND, BETWEEN_THROWS, VolcanoGame, LEMONS_PER_ROUND, type VolcanoEvent } from './volcanoGame'
import { MAX_AIM, craterAt } from './lemon'

const FRAME = 1 / 60

/** A random source whose first value picks the crater's aim: 0.5 is straight ahead. */
const craterAimedAt = (fraction: number) => () => fraction
const straightAhead = craterAimedAt(0.5)

function runUntil(game: VolcanoGame, done: () => boolean, limit = 60 * 60): VolcanoEvent[] {
  const events: VolcanoEvent[] = []
  for (let i = 0; i < limit && !done(); i++) events.push(...game.tick(FRAME))
  return events
}

function takeALemon(game: VolcanoGame): VolcanoEvent[] {
  game.toss()
  return runUntil(game, () => game.snapshot().phase !== 'flying')
}

describe('a new round', () => {
  it('starts aiming straight ahead with all lemons left and no score', () => {
    expect(new VolcanoGame(straightAhead).snapshot()).toMatchObject({
      phase: 'aiming',
      aim: 0,
      score: 0,
      lemonsLeft: LEMONS_PER_ROUND,
      lemon: null,
    })
  })

  it('puts the first crater where the random source says', () => {
    const left = new VolcanoGame(craterAimedAt(0)).snapshot().craterX
    const right = new VolcanoGame(craterAimedAt(1)).snapshot().craterX

    expect(left).toBeCloseTo(craterAt(-MAX_AIM))
    expect(right).toBeCloseTo(craterAt(MAX_AIM))
  })
})

describe('aiming', () => {
  it('turns left and right over time', () => {
    const game = new VolcanoGame(straightAhead)

    game.aim('right', 0.1)
    expect(game.snapshot().aim).toBeCloseTo(AIM_DEGREES_PER_SECOND * 0.1)
    game.aim('left', 0.3)
    expect(game.snapshot().aim).toBeCloseTo(-AIM_DEGREES_PER_SECOND * 0.2)
  })

  it('stops at the widest angle', () => {
    const game = new VolcanoGame(straightAhead)

    game.aim('right', 100)
    expect(game.snapshot().aim).toBe(MAX_AIM)
    game.aim('left', 100)
    expect(game.snapshot().aim).toBe(-MAX_AIM)
  })

  it('cannot be changed while the lemon is in the air', () => {
    const game = new VolcanoGame(straightAhead)
    game.toss()

    game.aim('right', 1)

    expect(game.snapshot().aim).toBe(0)
  })
})

describe('tossing', () => {
  it('throws the lemon and uses up a throw', () => {
    const game = new VolcanoGame(straightAhead)

    game.toss()

    expect(game.snapshot()).toMatchObject({ phase: 'flying', lemonsLeft: LEMONS_PER_ROUND - 1 })
    expect(game.snapshot().lemon).not.toBeNull()
  })

  it('ignores a second press while the lemon is already flying', () => {
    const game = new VolcanoGame(straightAhead)
    game.toss()
    game.toss()

    expect(game.snapshot().lemonsLeft).toBe(LEMONS_PER_ROUND - 1)
  })

  it('scores when aimed at the crater', () => {
    const game = new VolcanoGame(straightAhead)

    const events = takeALemon(game)

    expect(events).toContainEqual({ type: 'scored' })
    expect(game.snapshot().score).toBe(1)
  })

  it('misses when aimed away from the crater', () => {
    const game = new VolcanoGame(craterAimedAt(1))

    game.aim('left', 100)
    const events = takeALemon(game)

    expect(events).toContainEqual({ type: 'missed' })
    expect(game.snapshot().score).toBe(0)
  })
})

describe('between lemons', () => {
  it('waits a moment, then moves the crater and lets the player aim again', () => {
    const values = [0.5, 1]
    const game = new VolcanoGame(() => values.shift() ?? 1)
    const firstCrater = game.snapshot().craterX
    takeALemon(game)
    expect(game.snapshot().phase).toBe('between')

    game.tick(BETWEEN_THROWS + FRAME)

    expect(game.snapshot().phase).toBe('aiming')
    expect(game.snapshot().craterX).not.toBe(firstCrater)
    expect(game.snapshot().lemon).toBeNull()
  })

  it('does not accept a lemon until aiming again', () => {
    const game = new VolcanoGame(straightAhead)
    takeALemon(game)

    game.toss()

    expect(game.snapshot().lemonsLeft).toBe(LEMONS_PER_ROUND - 1)
  })
})

describe('the end of the round', () => {
  function playWholeRound() {
    const game = new VolcanoGame(straightAhead)
    const events: VolcanoEvent[] = []
    while (game.snapshot().phase !== 'over') {
      if (game.snapshot().phase === 'aiming') game.toss()
      events.push(...game.tick(FRAME))
    }
    return { game, events }
  }

  it('is over after the last lemon, and says so once', () => {
    const { game, events } = playWholeRound()

    expect(game.snapshot().lemonsLeft).toBe(0)
    expect(events.filter((e) => e.type === 'roundOver')).toHaveLength(1)
    expect(events.at(-1)).toEqual({ type: 'roundOver' })
  })

  it('scores every lemon when aimed perfectly each time', () => {
    expect(playWholeRound().game.snapshot().score).toBe(LEMONS_PER_ROUND)
  })

  it('ignores everything once over', () => {
    const { game } = playWholeRound()
    const before = game.snapshot()

    game.toss()
    game.aim('left', 1)
    game.tick(1)

    expect(game.snapshot()).toEqual(before)
  })
})

describe('pausing', () => {
  it('freezes the lemon, aiming and tossing until resumed', () => {
    const game = new VolcanoGame(straightAhead)
    game.toss()
    game.tick(0.2)
    game.togglePause()
    const frozen = game.snapshot()

    game.tick(1)
    game.aim('left', 1)
    game.toss()
    expect(game.snapshot()).toEqual({ ...frozen })
    expect(game.snapshot().paused).toBe(true)

    game.togglePause()
    game.tick(0.1)
    expect(game.snapshot().paused).toBe(false)
    expect(game.snapshot().lemon).not.toEqual(frozen.lemon)
  })
})
