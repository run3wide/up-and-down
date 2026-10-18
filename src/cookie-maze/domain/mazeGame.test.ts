import { describe, expect, it } from 'vitest'
import { Maze } from './maze'
import { BLAST_RADIUS, COOKIE_POINTS, MAX_LIVES, MazeGame, STAR_BONUS_SECONDS, TIME_LIMIT_SECONDS } from './mazeGame'

function gameIn(...rows: string[]) {
  return new MazeGame(Maze.fromRows(rows))
}

/** A 2 second clock on a corridor too long to finish before it runs out. */
function gameTooBigForTheClock() {
  const game = new MazeGame(Maze.fromRows(['S' + '.'.repeat(30)]), 2)
  game.step('right')
  return game
}

function loseAllButOneLife(game: MazeGame) {
  for (let attempt = 1; attempt < MAX_LIVES; attempt++) {
    game.tick(2)
    game.tryAgain()
    game.step('right')
  }
}

describe('MazeGame', () => {
  it('waits at the start, with the clock stopped, until the first step', () => {
    const game = gameIn('S..')

    game.tick(5)

    expect(game.snapshot()).toMatchObject({ phase: 'ready', x: 0, y: 0, secondsLeft: TIME_LIMIT_SECONDS, cookiesLeft: 2 })
  })

  it('moves exactly one cell for each step, and no further', () => {
    const game = gameIn('S...')

    game.step('right')
    game.tick(5)

    expect(game.snapshot()).toMatchObject({ phase: 'playing', x: 1, y: 0, heading: 'right' })
  })

  it.each([
    ['up', { x: 1, y: 0 }],
    ['down', { x: 1, y: 2 }],
    ['left', { x: 0, y: 1 }],
    ['right', { x: 2, y: 1 }],
  ] as const)('steps %s', (direction, expected) => {
    const game = gameIn('...', '.S.', '...')

    game.step(direction)

    expect(game.snapshot()).toMatchObject(expected)
  })

  it('eats the cookie in the cell it steps into', () => {
    const game = gameIn('S..')

    const events = game.step('right')

    expect(events).toEqual([{ type: 'cookieEaten', cell: { row: 0, column: 1 } }])
    expect(game.snapshot()).toMatchObject({ cookiesEaten: 1, cookiesLeft: 1 })
  })

  it('stays put when a wall is in the way, and the clock does not start', () => {
    const game = gameIn('S.', '#.')

    const events = game.step('down')

    expect(events).toEqual([])
    expect(game.snapshot()).toMatchObject({ phase: 'ready', x: 0, y: 0 })
  })

  it('does not eat a cookie twice when it walks back over the same cell', () => {
    const game = gameIn('S..')
    game.step('right')

    expect(game.step('left')).toEqual([])
    expect(game.step('right')).toEqual([])
    expect(game.snapshot().cookiesEaten).toBe(1)
  })

  it('is won when the last cookie is eaten, scoring cookies plus a point for every second to spare', () => {
    const game = gameIn('S.', '#.')
    game.step('right')
    game.tick(10)

    const events = game.step('down')

    expect(events).toContainEqual({ type: 'won' })
    expect(game.snapshot()).toMatchObject({ phase: 'won', cookiesLeft: 0, score: 2 * COOKIE_POINTS + (TIME_LIMIT_SECONDS - 10) })
  })

  it('stops there: nothing moves once it is won', () => {
    const game = gameIn('S..')
    game.step('right')
    game.step('right')

    game.step('left')
    game.tick(5)

    expect(game.snapshot()).toMatchObject({ phase: 'won', x: 2, secondsLeft: TIME_LIMIT_SECONDS })
  })

  it('counts the clock down once it has set off', () => {
    const game = gameIn('S....')
    game.step('right')

    game.tick(1.5)

    expect(game.snapshot().secondsLeft).toBe(TIME_LIMIT_SECONDS - 1.5)
  })

  it('costs a life when time runs out, and stops there', () => {
    const game = gameTooBigForTheClock()

    const events = game.tick(5)

    expect(events).toEqual([{ type: 'timeUp', livesLeft: MAX_LIVES - 1 }])
    expect(game.snapshot()).toMatchObject({ phase: 'timeUp', lives: MAX_LIVES - 1, secondsLeft: 0 })
    game.step('right')
    expect(game.snapshot().x).toBe(1)
  })

  it('does not take a life from a dino that wins with the clock still running', () => {
    const game = new MazeGame(Maze.fromRows(['S.']), 1)
    game.step('right')

    game.tick(5)

    expect(game.snapshot()).toMatchObject({ phase: 'won', lives: MAX_LIVES })
  })

  it('starts the maze afresh on another try, keeping the lives lost so far', () => {
    const game = gameTooBigForTheClock()
    game.tick(5)

    game.tryAgain()

    expect(game.snapshot()).toMatchObject({
      phase: 'ready',
      lives: MAX_LIVES - 1,
      x: 0,
      y: 0,
      heading: null,
      cookiesEaten: 0,
      secondsLeft: 2,
    })
  })

  it('is over when the last life is lost, with no more tries', () => {
    const game = gameTooBigForTheClock()
    loseAllButOneLife(game)

    const events = game.tick(5)

    expect(events).toEqual([{ type: 'timeUp', livesLeft: 0 }])
    expect(game.snapshot()).toMatchObject({ phase: 'over', lives: 0 })
    game.tryAgain()
    expect(game.snapshot().phase).toBe('over')
  })

  it('freezes while paused: no steps, no clock', () => {
    const game = gameIn('S...')
    game.step('right')
    game.togglePause()

    game.step('right')
    game.tick(5)

    expect(game.snapshot()).toMatchObject({ paused: true, x: 1, secondsLeft: TIME_LIMIT_SECONDS })
    game.togglePause()
    game.step('right')
    expect(game.snapshot().x).toBe(2)
  })

  describe('super stars', () => {
    const cookiesAroundAStar = ['S*.....', '.......']

    it('go off like fireworks when stepped on, eating every cookie around them', () => {
      const game = gameIn(...cookiesAroundAStar)

      const events = game.step('right')

      const cleared = game.snapshot().cookiesEaten
      expect(events).toContainEqual({ type: 'starCollected', cell: { row: 0, column: 1 }, cookiesCleared: cleared })
      expect(cleared).toBeGreaterThan(0)
    })

    it('reach exactly as far as the blast radius, and no further', () => {
      const game = gameIn('S*' + '.'.repeat(BLAST_RADIUS + 3))

      game.step('right')

      const row = game.snapshot().remainingCookies.map((cookie) => cookie.column)
      expect(Math.min(...row)).toBe(1 + BLAST_RADIUS + 1)
    })

    it('add seconds back to the clock', () => {
      const game = new MazeGame(Maze.fromRows(['S.*.........']), 20)
      game.step('right')
      game.tick(8)

      game.step('right')

      expect(game.snapshot().secondsLeft).toBe(12 + STAR_BONUS_SECONDS)
    })

    it('never add more than the clock started with', () => {
      const game = new MazeGame(Maze.fromRows(['S.*.........']), 20)
      game.step('right')
      game.tick(1)

      game.step('right')

      expect(game.snapshot().secondsLeft).toBe(20)
    })

    it('can win the maze by clearing the last cookies', () => {
      const game = gameIn('S*..')

      const events = game.step('right')

      expect(events).toContainEqual({ type: 'won' })
      expect(game.snapshot()).toMatchObject({ phase: 'won', cookiesLeft: 0, cookiesEaten: 2 })
    })

    it('count the cleared cookies in the score', () => {
      const game = gameIn('S*..')
      game.step('right')

      expect(game.snapshot().score).toBe(2 * COOKIE_POINTS + TIME_LIMIT_SECONDS)
    })

    it('are used up: a star only goes off once', () => {
      const game = gameIn('S*.......', '.........')
      game.step('right')

      game.step('left')
      const events = game.step('right')

      expect(events).toEqual([])
      expect(game.snapshot().remainingStars).toEqual([])
    })

    it('come back, with the cookies, when the maze is tried again', () => {
      const game = new MazeGame(Maze.fromRows(['S*...........']), 2)
      game.step('right')
      game.tick(5)

      game.tryAgain()

      expect(game.snapshot().remainingStars).toEqual([{ row: 0, column: 1 }])
    })
  })
})
