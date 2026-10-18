import { describe, expect, it } from 'vitest'
import { Maze } from './maze'
import { COOKIE_POINTS, MAX_LIVES } from './mazeGame'
import { MazeRun, type MazeLevel } from './mazeRun'

const level = (...rows: string[]): MazeLevel => ({ maze: Maze.fromRows(rows), timeLimit: 10 })

describe('MazeRun', () => {
  it('starts on the first maze', () => {
    const run = new MazeRun([level('S.'), level('S..')])

    expect(run.snapshot()).toMatchObject({ mazeNumber: 1, mazeCount: 2, cookiesLeft: 1, allCleared: false })
  })

  it('says which maze is being played, so it can be drawn', () => {
    const second = level('S..')
    const run = new MazeRun([level('S.'), second])
    run.step('right')

    run.nextMaze()

    expect(run.snapshot().maze).toBe(second.maze)
  })

  it('plays each maze with its own clock', () => {
    const run = new MazeRun([level('S.'), { maze: Maze.fromRows(['S..']), timeLimit: 30 }])
    run.step('right')

    run.nextMaze()

    expect(run.snapshot().secondsLeft).toBe(30)
  })

  it('moves on to the next maze once the first is cleared', () => {
    const run = new MazeRun([level('S.'), level('S..')])
    run.step('right')

    run.nextMaze()

    expect(run.snapshot()).toMatchObject({ mazeNumber: 2, phase: 'ready', x: 0, cookiesLeft: 2 })
  })

  it('stays on a maze that is not cleared yet', () => {
    const run = new MazeRun([level('S..'), level('S.')])
    run.step('right')

    run.nextMaze()

    expect(run.snapshot()).toMatchObject({ mazeNumber: 1, x: 1 })
  })

  it('refills the tries for each new maze', () => {
    const run = new MazeRun([{ maze: Maze.fromRows(['S..']), timeLimit: 1 }, level('S.')])
    run.step('right')
    run.tick(2)
    run.tryAgain()
    run.step('right')
    run.step('right')
    expect(run.snapshot().lives).toBe(MAX_LIVES - 1)

    run.nextMaze()

    expect(run.snapshot().lives).toBe(MAX_LIVES)
  })

  it('adds up the score across mazes', () => {
    const run = new MazeRun([level('S.'), level('S.')])
    run.step('right')
    const firstMaze = run.snapshot().score
    run.nextMaze()
    run.step('right')

    expect(run.snapshot().runScore).toBe(firstMaze + run.snapshot().score)
    expect(run.snapshot().runScore).toBeGreaterThan(2 * COOKIE_POINTS)
  })

  it('is all cleared when the last maze is won, with no maze after it', () => {
    const run = new MazeRun([level('S.')])
    run.step('right')

    run.nextMaze()

    expect(run.snapshot()).toMatchObject({ mazeNumber: 1, phase: 'won', allCleared: true })
  })

  it('keeps the score of the mazes cleared when the tries run out', () => {
    const run = new MazeRun([level('S.'), { maze: Maze.fromRows(['S......']), timeLimit: 1 }])
    run.step('right')
    run.nextMaze()
    for (let attempt = 0; attempt < MAX_LIVES; attempt++) {
      run.step('right')
      run.tick(2)
      run.tryAgain()
    }

    expect(run.snapshot()).toMatchObject({ phase: 'over', mazeNumber: 2 })
    expect(run.snapshot().runScore).toBeGreaterThan(COOKIE_POINTS)
  })
})
