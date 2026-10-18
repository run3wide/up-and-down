import { describe, expect, it } from 'vitest'
import { MAZE_LEVELS } from './levels'

describe('the mazes', () => {
  it('are several, each a real maze with cookies to find and a super star to reach', () => {
    expect(MAZE_LEVELS.length).toBeGreaterThanOrEqual(3)
    for (const { maze } of MAZE_LEVELS) {
      expect(maze.cookieCells.length).toBeGreaterThan(40)
      expect(maze.starCells.length).toBeGreaterThan(0)
    }
  })

  it('are walled in on every side', () => {
    for (const { maze } of MAZE_LEVELS) {
      const { rows, columns } = maze
      for (let row = 0; row < rows; row++) {
        expect(maze.isOpen({ row, column: 0 })).toBe(false)
        expect(maze.isOpen({ row, column: columns - 1 })).toBe(false)
      }
      for (let column = 0; column < columns; column++) {
        expect(maze.isOpen({ row: 0, column })).toBe(false)
        expect(maze.isOpen({ row: rows - 1, column })).toBe(false)
      }
    }
  })

  it('give every maze a clock that is long enough to be fair', () => {
    for (const { maze, timeLimit } of MAZE_LEVELS) {
      expect(timeLimit).toBeGreaterThanOrEqual(maze.cookieCells.length * 0.75)
    }
  })
})
