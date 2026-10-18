import { describe, expect, it } from 'vitest'
import { COOKIE_MAZE } from './layout'

describe('the cookie maze', () => {
  it('is a real maze with plenty of cookies to find', () => {
    expect(COOKIE_MAZE.cookieCells.length).toBeGreaterThan(40)
  })

  it('is walled in on every side', () => {
    const { rows, columns } = COOKIE_MAZE
    for (let row = 0; row < rows; row++) {
      expect(COOKIE_MAZE.isOpen({ row, column: 0 })).toBe(false)
      expect(COOKIE_MAZE.isOpen({ row, column: columns - 1 })).toBe(false)
    }
    for (let column = 0; column < columns; column++) {
      expect(COOKIE_MAZE.isOpen({ row: 0, column })).toBe(false)
      expect(COOKIE_MAZE.isOpen({ row: rows - 1, column })).toBe(false)
    }
  })
})
