import { describe, expect, it } from 'vitest'
import type { MathQuestion, Quiz } from '../../dino-race/domain/quiz'
import { BakeGame } from './bakeGame'
import { CHOICES, STEPS } from './ingredients'

const question = (prompt: string): MathQuestion => ({ prompt, options: ['right', 'wrong one', 'wrong two'], correctIndex: 0, explanation: 'Like things go together' })

function recordingQuiz() {
  const asked: number[] = []
  const quiz: Quiz = { ask: (number) => (asked.push(number), question(`Question ${number} =`)) }
  return { quiz, asked }
}

function newGame() {
  const { quiz, asked } = recordingQuiz()
  return { game: new BakeGame(quiz), asked }
}

const solve = (game: BakeGame) => game.answer(0)

function bakeWholeCake(game: BakeGame) {
  for (const step of STEPS) {
    solve(game)
    game.choose(CHOICES[step][0].name)
  }
}

describe('BakeGame', () => {
  it('starts on the shape step with a question to answer before anything can be chosen', () => {
    const { game } = newGame()

    expect(game.snapshot()).toMatchObject({ phase: 'question', step: 'shape', cakesBaked: 0, cake: {} })
    expect(game.snapshot().question.prompt).toBe('Question 1 =')
    expect(game.snapshot().choices).toEqual([])
    expect(game.choose('Dinosaur')).toEqual([])
    expect(game.snapshot().cake).toEqual({})
  })

  it('cheers a right answer and unlocks the choices for that step', () => {
    const { game } = newGame()

    expect(solve(game)).toEqual([{ type: 'answeredRight', explanation: 'Like things go together' }])

    expect(game.snapshot().phase).toBe('choosing')
    expect(game.snapshot().choices).toBe(CHOICES.shape)
  })

  it('gently says no to a wrong answer: it costs nothing and the question stays', () => {
    const { game } = newGame()

    expect(game.answer(1)).toEqual([{ type: 'wrongAnswer', option: 1 }])

    expect(game.snapshot()).toMatchObject({ phase: 'question', step: 'shape' })
    expect(game.snapshot().wrongOptions).toEqual([1])
    expect(game.answer(0)).toHaveLength(1)
  })

  it('ignores an answer that is not one of the options', () => {
    const { game } = newGame()

    expect(game.answer(7)).toEqual([])
    expect(game.snapshot().wrongOptions).toEqual([])
  })

  it('puts a chosen ingredient on the cake and moves on to the next step with a fresh question', () => {
    const { game } = newGame()
    solve(game)

    const events = game.choose('Shark')

    expect(events).toEqual([{ type: 'chosen', step: 'shape', choice: CHOICES.shape[4] }])
    expect(game.snapshot()).toMatchObject({ phase: 'question', step: 'flavour', cake: { shape: CHOICES.shape[4] } })
    expect(game.snapshot().question.prompt).toBe('Question 2 =')
    expect(game.snapshot().wrongOptions).toEqual([])
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

    const events = game.choose('Sprinkles')

    expect(events.map((event) => event.type)).toEqual(['chosen', 'cakeBaked'])
  })

  it('starts a clean cake on request, keeping the count, and asks harder questions as more are baked', () => {
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
