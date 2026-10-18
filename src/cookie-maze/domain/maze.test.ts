import { describe, expect, it } from 'vitest'
import { Maze, MazeLayoutError, stepFrom } from './maze'

describe('Maze', () => {
  it('reads walls, cookies and the start from a drawing', () => {
    const maze = Maze.fromRows(['####', '#S.#', '####'])

    expect(maze.rows).toBe(3)
    expect(maze.columns).toBe(4)
    expect(maze.start).toEqual({ row: 1, column: 1 })
    expect(maze.cookieCells).toEqual([{ row: 1, column: 2 }])
    expect(maze.isOpen({ row: 1, column: 2 })).toBe(true)
    expect(maze.isOpen({ row: 0, column: 0 })).toBe(false)
  })

  it('marks super stars, which are open path with no cookie of their own', () => {
    const maze = Maze.fromRows(['S.*'])

    expect(maze.starCells).toEqual([{ row: 0, column: 2 }])
    expect(maze.cookieCells).toEqual([{ row: 0, column: 1 }])
    expect(maze.isOpen({ row: 0, column: 2 })).toBe(true)
  })

  it('refuses a star the dino could never reach', () => {
    expect(() => Maze.fromRows(['S#*'])).toThrow(MazeLayoutError)
  })

  it('treats everything outside the drawing as wall', () => {
    const maze = Maze.fromRows(['S.'])

    expect(maze.isOpen({ row: -1, column: 0 })).toBe(false)
    expect(maze.isOpen({ row: 0, column: 2 })).toBe(false)
  })

  it('needs a start', () => {
    expect(() => Maze.fromRows(['#.#'])).toThrow(MazeLayoutError)
  })

  it('needs rows of the same length', () => {
    expect(() => Maze.fromRows(['S..', '#.'])).toThrow(MazeLayoutError)
  })

  it('refuses a cookie the dino could never reach', () => {
    expect(() => Maze.fromRows(['S#.'])).toThrow(MazeLayoutError)
  })

  it('steps one cell in a direction', () => {
    expect(stepFrom({ row: 2, column: 2 }, 'up')).toEqual({ row: 1, column: 2 })
    expect(stepFrom({ row: 2, column: 2 }, 'down')).toEqual({ row: 3, column: 2 })
    expect(stepFrom({ row: 2, column: 2 }, 'left')).toEqual({ row: 2, column: 1 })
    expect(stepFrom({ row: 2, column: 2 }, 'right')).toEqual({ row: 2, column: 3 })
  })
})
