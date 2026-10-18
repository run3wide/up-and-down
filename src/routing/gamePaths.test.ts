import { describe, expect, it } from 'vitest'
import { gameAtPath, pathFor } from './gamePaths'

describe('game paths', () => {
  it.each([
    ['/', '/', null],
    ['/up-and-down', '/', 'up-and-down'],
    ['/lemon-volcano', '/', 'lemon-volcano'],
    ['/dino-race', '/', 'dino-race'],
    ['/little-chef', '/', 'little-chef'],
    ['/match-up', '/', 'match-up'],
    ['/cookie-maze', '/', 'cookie-maze'],
    ['/tic-tac-toe', '/', 'tic-tac-toe'],
    ['/spelling-bee', '/', 'spelling-bee'],
    ['/lemon-volcano/', '/', 'lemon-volcano'],
    ['/up-and-down/', '/up-and-down/', null],
    ['/up-and-down/lemon-volcano', '/up-and-down/', 'lemon-volcano'],
    ['/up-and-down/up-and-down', '/up-and-down/', 'up-and-down'],
  ])('reads %s under base %s as %s', (pathname, base, expected) => {
    expect(gameAtPath(pathname, base)).toBe(expected)
  })

  it('shows the game picker for a path it does not know', () => {
    expect(gameAtPath('/nonsense', '/')).toBeNull()
    expect(gameAtPath('/elsewhere/lemon-volcano', '/up-and-down/')).toBeNull()
  })

  it('builds a path for each game and for the picker', () => {
    expect(pathFor('lemon-volcano', '/up-and-down/')).toBe('/up-and-down/lemon-volcano')
    expect(pathFor(null, '/up-and-down/')).toBe('/up-and-down/')
    expect(pathFor('up-and-down', '/')).toBe('/up-and-down')
  })

  it('round-trips', () => {
    for (const game of ['up-and-down', 'lemon-volcano', 'dino-race', 'little-chef', 'match-up', 'cookie-maze', 'tic-tac-toe', 'spelling-bee'] as const) {
      expect(gameAtPath(pathFor(game, '/x/'), '/x/')).toBe(game)
    }
  })
})
