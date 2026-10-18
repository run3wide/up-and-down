import { describe, expect, it } from 'vitest'
import { Maze } from './maze'
import { CELLS_PER_SECOND, COOKIE_POINTS, MazeGame, PAR_SECONDS } from './mazeGame'

const SECOND_PER_CELL = 1 / CELLS_PER_SECOND

function gameIn(...rows: string[]) {
  return new MazeGame(Maze.fromRows(rows))
}

describe('MazeGame', () => {
  it('waits at the start until the first direction is chosen', () => {
    const game = gameIn('S..')

    game.tick(5)

    expect(game.snapshot()).toMatchObject({ phase: 'ready', x: 0, y: 0, elapsed: 0, cookiesLeft: 2 })
  })

  it('keeps walking in the chosen direction on its own', () => {
    const game = gameIn('S...')

    game.steer('right')
    game.tick(SECOND_PER_CELL * 1.5)

    expect(game.snapshot()).toMatchObject({ phase: 'playing', x: 1.5, y: 0, heading: 'right' })
  })

  it('eats a cookie when it reaches its cell', () => {
    const game = gameIn('S...')
    game.steer('right')

    const events = game.tick(SECOND_PER_CELL)

    expect(events).toEqual([{ type: 'cookieEaten', cell: { row: 0, column: 1 } }])
    expect(game.snapshot()).toMatchObject({ cookiesEaten: 1, cookiesLeft: 2 })
  })

  it('stops against a wall and waits for the next direction', () => {
    const game = gameIn('S.#')
    game.steer('right')

    game.tick(5)

    expect(game.snapshot()).toMatchObject({ x: 1, y: 0, heading: null })
  })

  it('does not move into a wall it is asked to face', () => {
    const game = gameIn('S.', '#.')
    game.steer('down')

    game.tick(1)

    expect(game.snapshot()).toMatchObject({ x: 0, y: 0, heading: null })
  })

  it('turns at the first gap after a turn is asked for', () => {
    const game = gameIn('S...', '#.#.')
    game.steer('right')
    game.tick(SECOND_PER_CELL * 0.5)

    game.steer('down')
    game.tick(SECOND_PER_CELL)

    expect(game.snapshot()).toMatchObject({ x: 1, y: 0.5, heading: 'down' })
  })

  it('walks on past a gap it was not asked to take', () => {
    const game = gameIn('S...', '#.#.')
    game.steer('right')

    game.tick(SECOND_PER_CELL * 2)

    expect(game.snapshot()).toMatchObject({ x: 2, y: 0, heading: 'right' })
  })

  it('can turn straight round between cells', () => {
    const game = gameIn('.S..')
    game.steer('right')
    game.tick(SECOND_PER_CELL * 0.25)

    game.steer('left')

    expect(game.snapshot()).toMatchObject({ x: 1.25, heading: 'left' })
    game.tick(SECOND_PER_CELL * 0.25)
    expect(game.snapshot().x).toBeCloseTo(1)
  })

  it('carries leftover time across a corner', () => {
    const game = gameIn('S.', '#.')
    game.steer('right')
    game.steer('down')

    game.tick(SECOND_PER_CELL * 1.5)

    expect(game.snapshot()).toMatchObject({ x: 1, y: 0.5, heading: 'down' })
  })

  it('is won when the last cookie is eaten, scoring cookies plus a bonus for speed', () => {
    const game = gameIn('S.', '#.')
    game.steer('right')
    game.tick(SECOND_PER_CELL)
    game.steer('down')

    const events = game.tick(SECOND_PER_CELL)

    expect(events).toContainEqual({ type: 'won' })
    const snapshot = game.snapshot()
    expect(snapshot.phase).toBe('won')
    expect(snapshot.cookiesLeft).toBe(0)
    expect(snapshot.score).toBe(2 * COOKIE_POINTS + Math.round(PAR_SECONDS - SECOND_PER_CELL * 2))
  })

  it('stops there: nothing moves once it is won', () => {
    const game = gameIn('S.#')
    game.steer('right')
    game.tick(SECOND_PER_CELL)

    game.steer('left')
    game.tick(5)

    expect(game.snapshot()).toMatchObject({ phase: 'won', x: 1 })
  })

  it('gives no speed bonus to a slow dino', () => {
    const game = gameIn('S..')
    game.steer('down')
    game.tick(PAR_SECONDS * 2)
    game.steer('right')
    game.tick(SECOND_PER_CELL * 2)

    expect(game.snapshot().score).toBe(2 * COOKIE_POINTS)
  })

  it('freezes while paused, including the clock', () => {
    const game = gameIn('S...')
    game.steer('right')
    game.togglePause()

    game.tick(5)

    expect(game.snapshot()).toMatchObject({ paused: true, x: 0, elapsed: 0 })
    game.togglePause()
    game.tick(SECOND_PER_CELL)
    expect(game.snapshot().x).toBe(1)
  })

  it('remembers the direction chosen while paused', () => {
    const game = gameIn('S..')
    game.togglePause()
    game.steer('right')
    game.togglePause()

    game.tick(SECOND_PER_CELL)

    expect(game.snapshot().x).toBe(1)
  })
})
