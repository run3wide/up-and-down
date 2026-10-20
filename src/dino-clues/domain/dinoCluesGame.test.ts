import { describe, expect, it } from 'vitest'
import { DinoCluesGame } from './dinoCluesGame'
import type { HidingPlace, Mystery } from './mysteries'

const banana = { name: 'banana', emoji: '🍌', phrase: 'a banana' }
const apple = { name: 'apple', emoji: '🍎', phrase: 'a apple' }
const cookie = { name: 'cookie', emoji: '🍪', phrase: 'a cookie' }
const carrot = { name: 'carrot', emoji: '🥕', phrase: 'a carrot' }

const snack: Mystery = {
  question: 'What does Dino want for a snack?',
  answer: banana,
  choices: [apple, banana, cookie],
  clues: [
    { emoji: '🟡', text: 'It is yellow.' },
    { emoji: '🐵', text: 'Monkeys love it.' },
    { emoji: '🤲', text: 'You peel it.' },
  ],
}
const other: Mystery = {
  question: 'What does Dino want?',
  answer: carrot,
  choices: [carrot, apple, cookie],
  clues: [
    { emoji: '🟠', text: 'It is orange.' },
    { emoji: '🌱', text: 'It grows under the ground.' },
    { emoji: '🐰', text: 'Rabbits love it.' },
  ],
}

const places: readonly HidingPlace[] = ['tree', 'rock', 'bucket', 'tent', 'basket'].map((name) => ({ name, emoji: name }))

/** With every random value at 0 nothing is shuffled: the mysteries come in order, the clues are in the first three places, and the choices stay as given. */
const inOrder = () => 0

function newGame(mysteries: readonly Mystery[] = [snack, other]) {
  return new DinoCluesGame(mysteries, places, inOrder)
}

function findAllClues(game: DinoCluesGame) {
  return [0, 1, 2].flatMap((place) => game.look(place))
}

describe('DinoCluesGame', () => {
  it('starts with a mystery to solve, every place still to look in, and no clues found', () => {
    const snapshot = newGame().snapshot()

    expect(snapshot.phase).toBe('looking')
    expect(snapshot.question).toBe(snack.question)
    expect(snapshot.places.map((place) => place.state)).toEqual(['hidden', 'hidden', 'hidden', 'hidden', 'hidden'])
    expect(snapshot.cluesFound).toEqual([])
    expect(snapshot.solved).toBe(0)
  })

  it('finds a clue in a place that has one, and shows it', () => {
    const game = newGame()

    const events = game.look(0)

    expect(events).toEqual([{ type: 'clueFound', clue: snack.clues[0], number: 1 }])
    expect(game.snapshot().cluesFound).toEqual([snack.clues[0]])
    expect(game.snapshot().places[0].state).toBe('clue')
  })

  it('says there is nothing in a place with no clue, and costs nothing', () => {
    const game = newGame()

    const events = game.look(4)

    expect(events).toEqual([{ type: 'nothingHere', place: places[4] }])
    expect(game.snapshot().places[4].state).toBe('empty')
    expect(game.snapshot().cluesFound).toEqual([])
  })

  it('does not find the same clue twice', () => {
    const game = newGame()
    game.look(0)

    expect(game.look(0)).toEqual([])
    expect(game.snapshot().cluesFound).toHaveLength(1)
  })

  it('ignores a place that is not there', () => {
    expect(newGame().look(9)).toEqual([])
  })

  it('moves on to thinking once all three clues are found', () => {
    const game = newGame()

    const events = findAllClues(game)

    expect(events.at(-1)).toEqual({ type: 'allCluesFound' })
    expect(game.snapshot().phase).toBe('thinking')
    expect(game.snapshot().choices).toEqual(snack.choices)
  })

  it('keeps the choices hidden until all the clues are found', () => {
    expect(newGame().snapshot().choices).toEqual([])
  })

  it('sends a wrong guess back at no cost', () => {
    const game = newGame()
    findAllClues(game)

    const events = game.guess(0)

    expect(events).toEqual([{ type: 'wrongGuess', choice: apple }])
    expect(game.snapshot().phase).toBe('thinking')
    expect(game.snapshot().solved).toBe(0)
  })

  it('solves the mystery with the right guess, and scores', () => {
    const game = newGame()
    findAllClues(game)

    const events = game.guess(1)

    expect(events).toEqual([{ type: 'solved', answer: banana }])
    expect(game.snapshot().phase).toBe('solved')
    expect(game.snapshot().answer).toEqual(banana)
    expect(game.snapshot().solved).toBe(1)
  })

  it('does not take a guess before the clues are found', () => {
    const game = newGame()

    expect(game.guess(1)).toEqual([])
    expect(game.snapshot().phase).toBe('looking')
  })

  it('brings the next mystery, with every place hidden again', () => {
    const game = newGame()
    findAllClues(game)
    game.guess(1)

    game.nextMystery()

    expect(game.snapshot().phase).toBe('looking')
    expect(game.snapshot().question).toBe(other.question)
    expect(game.snapshot().places.map((place) => place.state)).toEqual(['hidden', 'hidden', 'hidden', 'hidden', 'hidden'])
    expect(game.snapshot().cluesFound).toEqual([])
    expect(game.snapshot().answer).toBeNull()
  })

  it('ignores nextMystery until this one is solved', () => {
    const game = newGame()

    game.nextMystery()

    expect(game.snapshot().question).toBe(snack.question)
  })

  it('never asks the same mystery twice in a row when the deck runs out', () => {
    const game = newGame([snack])
    const asked: string[] = []

    for (let round = 0; round < 3; round++) {
      asked.push(game.snapshot().question)
      findAllClues(game)
      game.guess(1)
      game.nextMystery()
    }

    expect(asked).toEqual([snack.question, snack.question, snack.question])
  })

  it('hides the clues in places chosen with the random source it is given', () => {
    const lastPlaces = () => 0.99
    const game = new DinoCluesGame([snack], places, lastPlaces)
    const cluePlaces = game.snapshot().places.map((_, place) => place).filter((place) => game.look(place).some((event) => event.type === 'clueFound'))

    expect(cluePlaces).not.toEqual([0, 1, 2])
    expect(cluePlaces).toHaveLength(3)
  })
})
