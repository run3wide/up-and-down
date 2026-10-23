import { describe, expect, it } from 'vitest'
import type { Term } from '../../shared/likeThings'
import { GroupGame, type GroupQuiz } from './groupGame'

const term = (count: number, symbol: string): Term => ({ count, symbol })

/** 3x + 2y + 2x: the x terms are chips 0 and 2, the y term is chip 1. */
const threeParts = [term(3, 'x'), term(2, 'y'), term(2, 'x')]

function newGame(terms: readonly Term[] = threeParts) {
  const asked: number[] = []
  const quiz: GroupQuiz = { ask: (number) => (asked.push(number), terms) }
  return { game: new GroupGame(quiz), asked }
}

describe('GroupGame', () => {
  it('starts with every term still in the pile and a bin for each kind of thing, in the order they appear', () => {
    const { game } = newGame()

    const snapshot = game.snapshot()
    expect(snapshot).toMatchObject({ phase: 'sorting', prompt: '3x + 2y + 2x', grouped: 0 })
    expect(snapshot.pile.map((chip) => chip.term)).toEqual(threeParts)
    expect(snapshot.bins.map((bin) => bin.symbol)).toEqual(['x', 'y'])
    expect(snapshot.bins.every((bin) => bin.chips.length === 0 && bin.equation === null)).toBe(true)
    expect(snapshot.answer).toBeNull()
  })

  it('moves a chip into the bin for its own kind', () => {
    const { game } = newGame()

    expect(game.move(0, 'x')).toEqual([{ type: 'chipSorted', chip: 0, bin: 'x' }])

    const snapshot = game.snapshot()
    expect(snapshot.pile.map((chip) => chip.id)).toEqual([1, 2])
    expect(snapshot.bins[0].chips.map((chip) => chip.term)).toEqual([term(3, 'x')])
  })

  it('gently refuses a chip in the wrong bin: it stays in the pile and nothing is lost', () => {
    const { game } = newGame()

    expect(game.move(0, 'y')).toEqual([{ type: 'wrongBin', chip: 0, bin: 'y' }])

    expect(game.snapshot().pile).toHaveLength(3)
    expect(game.snapshot().bins[1].chips).toEqual([])
  })

  it('ignores a chip or bin that does not exist, and a chip already sorted', () => {
    const { game } = newGame()
    game.move(0, 'x')

    expect(game.move(9, 'x')).toEqual([])
    expect(game.move(1, 'z')).toEqual([])
    expect(game.move(0, 'x')).toEqual([])
  })

  it('shows the adding for a bin once all its chips are in, and not before', () => {
    const { game } = newGame()

    expect(game.move(0, 'x')).toHaveLength(1)
    expect(game.snapshot().bins[0].equation).toBeNull()
    expect(game.move(2, 'x')).toEqual([
      { type: 'chipSorted', chip: 2, bin: 'x' },
      { type: 'binFull', bin: 'x', equation: '3x + 2x = 5x' },
    ])
    expect(game.snapshot().bins[0].equation).toBe('3x + 2x = 5x')
  })

  it('shows a lone term as it is, since there is nothing to add', () => {
    const { game } = newGame()

    expect(game.move(1, 'y')).toContainEqual({ type: 'binFull', bin: 'y', equation: '2y' })
  })

  it('shows the whole answer once everything is sorted', () => {
    const { game } = newGame()
    game.move(0, 'x')
    game.move(1, 'y')

    const events = game.move(2, 'x')

    expect(events.at(-1)).toEqual({ type: 'allGrouped', answer: '5x + 2y' })
    expect(game.snapshot()).toMatchObject({ phase: 'grouped', answer: '5x + 2y', grouped: 1 })
  })

  it('does not take more moves once the sum is grouped', () => {
    const { game } = newGame([term(1, 'x')])
    game.move(0, 'x')

    expect(game.move(0, 'x')).toEqual([])
  })

  it('starts a fresh sum on request, keeping the count, and asks for harder ones as more are grouped', () => {
    const { game, asked } = newGame()
    for (const [chip, bin] of [[0, 'x'], [1, 'y'], [2, 'x']] as const) game.move(chip, bin)

    game.nextSum()

    expect(game.snapshot()).toMatchObject({ phase: 'sorting', grouped: 1 })
    expect(game.snapshot().pile).toHaveLength(3)
    expect(asked).toEqual([1, 2])
  })

  it('does nothing when asked for the next sum before this one is grouped', () => {
    const { game, asked } = newGame()

    game.nextSum()

    expect(asked).toEqual([1])
  })
})
