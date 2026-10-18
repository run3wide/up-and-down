import { describe, expect, it } from 'vitest'
import { Game, INTERMISSION, MAX_LIVES, type GameEvent } from './game'
import { WORLD_WIDTH } from './world'

const middle = () => 0.5
const FRAME = 1 / 60

function newGame(random = middle) {
  return new Game(random)
}

function tickUntil(game: Game, done: () => boolean, limit = 60 * 30) {
  const events: GameEvent[] = []
  for (let i = 0; i < limit && !done(); i++) events.push(...game.tick(FRAME))
  return events
}

describe('a new game', () => {
  it('starts with full lives, no score and the dinosaur in the middle', () => {
    const snap = newGame().snapshot()

    expect(snap).toMatchObject({ phase: 'playing', score: 0, lives: MAX_LIVES, dinoX: WORLD_WIDTH / 2 })
  })

  it('throws the first ball after the intermission', () => {
    const game = newGame()
    expect(game.snapshot().ball).toBeNull()

    game.tick(INTERMISSION + FRAME)

    expect(game.snapshot().ball).not.toBeNull()
  })
})

describe('moving the dinosaur', () => {
  it('moves left and right over time', () => {
    const game = newGame()

    game.moveDino('right', 0.1)
    const right = game.snapshot().dinoX
    game.moveDino('left', 0.2)

    expect(right).toBeGreaterThan(WORLD_WIDTH / 2)
    expect(game.snapshot().dinoX).toBeLessThan(WORLD_WIDTH / 2)
  })

  it('stays inside the world', () => {
    const game = newGame()

    game.moveDino('left', 100)

    expect(game.snapshot().dinoX).toBeGreaterThan(0)
  })

  it('can be placed directly, for touch dragging, and is kept in the world', () => {
    const game = newGame()

    game.placeDino(20)
    expect(game.snapshot().dinoX).toBe(20)

    game.placeDino(1000)
    expect(game.snapshot().dinoX).toBeLessThan(WORLD_WIDTH)
  })
})

describe('catching and missing', () => {
  it('scores a point and reports a catch when the dinosaur is under the ball', () => {
    const game = newGame()
    game.tick(INTERMISSION + FRAME)

    const events = tickUntil(game, () => game.snapshot().score > 0)

    expect(events).toContainEqual({ type: 'caught' })
    expect(game.snapshot().score).toBe(1)
    expect(game.snapshot().lives).toBe(MAX_LIVES)
  })

  it('loses a life and reports a miss when the dinosaur is elsewhere', () => {
    const game = newGame()
    game.placeDino(WORLD_WIDTH) // middle-thrown ball with no drift lands at 50
    game.tick(INTERMISSION + FRAME)

    const events = tickUntil(game, () => game.snapshot().lives < MAX_LIVES)

    expect(events).toContainEqual({ type: 'missed' })
    expect(game.snapshot().lives).toBe(MAX_LIVES - 1)
    expect(game.snapshot().score).toBe(0)
  })

  it('pauses between rounds before throwing the next ball', () => {
    const game = newGame()
    game.tick(INTERMISSION + FRAME)
    tickUntil(game, () => game.snapshot().score > 0)

    expect(game.snapshot().ball).toBeNull()
    game.tick(INTERMISSION + FRAME)
    expect(game.snapshot().ball).not.toBeNull()
  })

  it('is over when the last life is lost', () => {
    const game = newGame()
    game.placeDino(WORLD_WIDTH)

    const events = tickUntil(game, () => game.snapshot().phase === 'over')

    expect(game.snapshot().lives).toBe(0)
    expect(events.at(-1)).toEqual({ type: 'gameOver' })
  })

  it('ignores time and movement once over', () => {
    const game = newGame()
    game.placeDino(WORLD_WIDTH)
    tickUntil(game, () => game.snapshot().phase === 'over')
    const before = game.snapshot()

    game.tick(1)
    game.moveDino('left', 1)

    expect(game.snapshot()).toEqual(before)
  })
})

describe('randomness and difficulty', () => {
  it('varies the launch point and drift using the injected random source', () => {
    const low = newGame(() => 0)
    const high = newGame(() => 0.99)
    low.tick(INTERMISSION + FRAME)
    high.tick(INTERMISSION + FRAME)

    expect(low.snapshot().ball!.x).toBeLessThan(high.snapshot().ball!.x)
    expect(low.snapshot().ball!.vx).toBeLessThan(0)
    expect(high.snapshot().ball!.vx).toBeGreaterThan(0)
  })

  it('throws harder balls once the score is higher', () => {
    const early = newGame()
    early.tick(INTERMISSION + FRAME)
    const later = newGame()
    for (let i = 0; i < 5; i++) {
      later.tick(INTERMISSION + FRAME)
      tickUntil(later, () => later.snapshot().ball === null)
    }
    later.tick(INTERMISSION + FRAME)

    expect(later.snapshot().ball!.vy).toBeGreaterThan(early.snapshot().ball!.vy)
  })
})

describe('pausing', () => {
  it('freezes the game until resumed', () => {
    const game = newGame()
    game.tick(INTERMISSION + FRAME)
    game.pause()
    const frozen = game.snapshot()

    game.tick(0.5)
    game.moveDino('left', 0.5)
    expect(game.snapshot()).toEqual(frozen)

    game.resume()
    game.tick(0.1)
    expect(game.snapshot().ball).not.toEqual(frozen.ball)
  })

  it('toggles', () => {
    const game = newGame()

    game.togglePause()
    expect(game.snapshot().phase).toBe('paused')
    game.togglePause()
    expect(game.snapshot().phase).toBe('playing')
  })
})
