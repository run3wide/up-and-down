import { describe, expect, it } from 'vitest'
import { BakeGame, type Tile } from './bakeGame'
import { CHOICES, STEPS } from './ingredients'
import type { Sum, SumQuiz } from './sum'

/** 1x + 2y + 3x + 1y = 4x + 3y, with a spare 7 and 5, and a spare z. */
const algebra: Sum = {
  prompt: '1x + 2y + 3x + 1y =',
  answer: [{ count: 4, symbol: 'x' }, { count: 3, symbol: 'y' }],
  counts: [3, 7, 4, 5],
  symbols: ['y', 'z', 'x'],
  explanation: 'Keep x with x and y with y',
}

const justOne: Sum = { prompt: '2⭐ + 3⭐ =', answer: [{ count: 5, symbol: '⭐' }], counts: [5, 2, 6], symbols: ['⭐', '🔺'], explanation: 'Same things go together' }

function newGame(sums: Sum | ((questionNumber: number) => Sum) = algebra) {
  const asked: number[] = []
  const quiz: SumQuiz = { ask: (number) => (asked.push(number), typeof sums === 'function' ? sums(number) : sums) }
  return { game: new BakeGame(quiz), asked }
}

const tile = (game: BakeGame, kind: 'count' | 'symbol', value: number | string): Tile =>
  game.snapshot().tray.find((candidate) => (candidate.kind === 'count' ? candidate.count === value : candidate.symbol === value) && candidate.kind === kind)!

/** Slots go count, symbol, count, symbol: "[ ][ ] + [ ][ ]". */
function fill(game: BakeGame, parts: readonly (number | string)[]) {
  return parts.flatMap((part, slot) => game.place(tile(game, slot % 2 === 0 ? 'count' : 'symbol', part).id, slot))
}

function solve(game: BakeGame) {
  return fill(game, [4, 'x', 3, 'y'])
}

function bakeWholeCake(game: BakeGame) {
  for (const step of STEPS) {
    solve(game)
    game.choose(CHOICES[step][0].name)
  }
}

describe('BakeGame', () => {
  it('starts on the shape step with a sum, blanks for the answer, and every tile in the tray', () => {
    const { game } = newGame()

    const snapshot = game.snapshot()
    expect(snapshot).toMatchObject({ phase: 'question', step: 'shape', cakesBaked: 0, cake: {}, prompt: '1x + 2y + 3x + 1y =' })
    expect(snapshot.slots).toEqual([null, null, null, null])
    expect(snapshot.tray.filter((t) => t.kind === 'count').map((t) => t.kind === 'count' && t.count)).toEqual([3, 7, 4, 5])
    expect(snapshot.tray.filter((t) => t.kind === 'symbol')).toHaveLength(3)
    expect(snapshot.choices).toEqual([])
    expect(game.choose('Dinosaur')).toEqual([])
  })

  it('has one number blank and one symbol blank for each kind of thing in the answer', () => {
    expect(newGame(algebra).game.snapshot().slots).toHaveLength(4)
    expect(newGame(justOne).game.snapshot().slots).toHaveLength(2)
  })

  it('moves a tile out of the tray into a blank', () => {
    const { game } = newGame()
    const four = tile(game, 'count', 4)

    game.place(four.id, 0)

    expect(game.snapshot().slots[0]).toEqual(four)
    expect(game.snapshot().tray).not.toContainEqual(four)
  })

  it('only takes a number in a number blank and a symbol in a symbol blank', () => {
    const { game } = newGame()

    expect(game.place(tile(game, 'count', 4).id, 1)).toEqual([])
    expect(game.place(tile(game, 'symbol', 'x').id, 0)).toEqual([])
    expect(game.snapshot().slots).toEqual([null, null, null, null])
  })

  it('puts back a tile that was in the blank when another goes in', () => {
    const { game } = newGame()
    const four = tile(game, 'count', 4)
    game.place(four.id, 0)

    game.place(tile(game, 'count', 7).id, 0)

    expect(game.snapshot().tray).toContainEqual(four)
  })

  it('lets a tile be moved from one blank to another', () => {
    const { game } = newGame()
    const four = tile(game, 'count', 4)
    game.place(four.id, 0)

    game.place(four.id, 2)

    expect(game.snapshot().slots).toEqual([null, null, four, null])
  })

  it('takes a tile back out of a blank into the tray', () => {
    const { game } = newGame()
    const four = tile(game, 'count', 4)
    game.place(four.id, 0)

    game.takeBack(0)

    expect(game.snapshot().slots[0]).toBeNull()
    expect(game.snapshot().tray).toContainEqual(four)
  })

  it('ignores a tile that does not exist and a blank that does not exist', () => {
    const { game } = newGame()

    expect(game.place('nope', 0)).toEqual([])
    expect(game.place(tile(game, 'count', 4).id, 9)).toEqual([])
    expect(() => game.takeBack(9)).not.toThrow()
  })

  it('says nothing until every blank is full', () => {
    const { game } = newGame()

    expect(fill(game, [4, 'x', 3])).toEqual([])
    expect(game.snapshot().phase).toBe('question')
  })

  it('cheers the right answer and unlocks the choices for that step, keeping the answer on show', () => {
    const { game } = newGame()

    expect(solve(game)).toEqual([{ type: 'answeredRight', explanation: 'Keep x with x and y with y' }])

    expect(game.snapshot().phase).toBe('choosing')
    expect(game.snapshot().choices).toBe(CHOICES.shape)
    expect(game.snapshot().slots.every((slot) => slot !== null)).toBe(true)
  })

  it('accepts the terms the other way round: 3y + 4x is 4x + 3y', () => {
    const { game } = newGame()

    expect(fill(game, [3, 'y', 4, 'x'])).toEqual([{ type: 'answeredRight', explanation: 'Keep x with x and y with y' }])
  })

  it('gently says no to a wrong answer, empties the blanks and costs nothing', () => {
    const { game } = newGame()

    expect(fill(game, [7, 'x', 3, 'y'])).toEqual([{ type: 'wrongAnswer' }])

    expect(game.snapshot()).toMatchObject({ phase: 'question', step: 'shape', slots: [null, null, null, null], cakesBaked: 0 })
    expect(game.snapshot().tray).toHaveLength(7)
    expect(solve(game)).toHaveLength(1)
  })

  it('does not take more answers once the step is solved', () => {
    const { game } = newGame()
    solve(game)

    expect(game.place(game.snapshot().tray[0]?.id ?? 'none', 0)).toEqual([])
    expect(game.snapshot().phase).toBe('choosing')
  })

  it('puts a chosen ingredient on the cake and moves on to the next step with a fresh sum', () => {
    const { game, asked } = newGame()
    solve(game)

    const events = game.choose('Shark')

    expect(events).toEqual([{ type: 'chosen', step: 'shape', choice: CHOICES.shape[4] }])
    expect(game.snapshot()).toMatchObject({ phase: 'question', step: 'flavour', cake: { shape: CHOICES.shape[4] }, slots: [null, null, null, null] })
    expect(asked).toEqual([1, 2])
  })

  it('ignores something that is not on offer for this step', () => {
    const { game } = newGame()
    solve(game)

    expect(game.choose('Carrot')).toEqual([])
    expect(game.snapshot().step).toBe('shape')
  })

  it('bakes the cake after the last step and counts it', () => {
    const { game } = newGame()

    bakeWholeCake(game)

    const snapshot = game.snapshot()
    expect(snapshot.phase).toBe('baked')
    expect(snapshot.cakesBaked).toBe(1)
    expect(snapshot.cake).toEqual({ shape: CHOICES.shape[0], flavour: CHOICES.flavour[0], frosting: CHOICES.frosting[0], topping: CHOICES.topping[0] })
  })

  it('says the cake is baked when the last topping goes on', () => {
    const { game } = newGame()
    for (const step of STEPS.slice(0, 3)) {
      solve(game)
      game.choose(CHOICES[step][0].name)
    }
    solve(game)

    expect(game.choose('Sprinkles').map((event) => event.type)).toEqual(['chosen', 'cakeBaked'])
  })

  it('starts a clean cake on request, keeping the count, and asks harder sums as more are baked', () => {
    const { game, asked } = newGame()
    bakeWholeCake(game)

    game.nextCake()

    expect(game.snapshot()).toMatchObject({ phase: 'question', step: 'shape', cakesBaked: 1, cake: {} })
    expect(asked.slice(0, 4)).toEqual([1, 2, 3, 4])
    expect(asked[4]).toBeGreaterThan(1)
  })

  it('does nothing when asked for the next cake before this one is baked', () => {
    const { game } = newGame()

    game.nextCake()

    expect(game.snapshot()).toMatchObject({ phase: 'question', step: 'shape', cake: {} })
  })

  it('offers every ingredient the family asked for', () => {
    expect(CHOICES.shape.map((c) => c.name)).toEqual(['Dinosaur', 'Strawberry', 'Race car', 'Fish', 'Shark', 'Tiger'])
    expect(CHOICES.flavour.map((c) => c.name)).toEqual(['Strawberry', 'Chocolate', 'Carrot', 'Orange', 'Vanilla', 'Pumpkin'])
    expect(CHOICES.frosting.map((c) => c.name)).toEqual(['Vanilla', 'Strawberry', 'Chocolate', 'Raspberry', 'Lemon'])
    expect(CHOICES.topping).toHaveLength(5)
  })
})
