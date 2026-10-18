import { describe, expect, it } from 'vitest'
import { SpellingGame } from './spellingGame'
import { type Word, WORDS } from './words'

const cat: Word = { spelling: 'CAT', emoji: '🐱', sound: 'meow' }
const ball: Word = { spelling: 'BALL', emoji: '⚽' }
const apple: Word = { spelling: 'APPLE', emoji: '🍎' }

const firstWord = () => 0

function spell(game: SpellingGame, words: readonly Word[]) {
  const { spelling } = words.find((word) => word.emoji === game.snapshot().emoji)!
  return [...spelling].flatMap((letter, position) => game.place(letter, position))
}

describe('SpellingGame', () => {
  it('starts with a word to spell, empty blanks and nothing spelled', () => {
    const game = new SpellingGame([cat, ball], firstWord)

    expect(game.snapshot()).toEqual({ phase: 'spelling', emoji: '🐱', blanks: [null, null, null], wordsSpelled: 0 })
  })

  it('keeps a right letter in its blank', () => {
    const game = new SpellingGame([cat, ball], firstWord)

    expect(game.place('C', 0)).toEqual([{ type: 'letterPlaced', letter: 'C', position: 0 }])

    expect(game.snapshot().blanks).toEqual(['C', null, null])
  })

  it('sends a wrong letter back and leaves the blank empty', () => {
    const game = new SpellingGame([cat, ball], firstWord)

    expect(game.place('D', 0)).toEqual([{ type: 'wrongLetter', letter: 'D', position: 0 }])

    expect(game.snapshot().blanks).toEqual([null, null, null])
  })

  it('treats a letter that belongs elsewhere in the word as wrong for this blank', () => {
    const game = new SpellingGame([cat, ball], firstWord)

    expect(game.place('A', 0)).toEqual([{ type: 'wrongLetter', letter: 'A', position: 0 }])
  })

  it('accepts the same letter in each blank that needs it', () => {
    const game = new SpellingGame([ball], firstWord)

    game.place('L', 2)
    game.place('L', 3)

    expect(game.snapshot().blanks).toEqual([null, null, 'L', 'L'])
  })

  it('ignores a blank that is already filled and blanks that do not exist', () => {
    const game = new SpellingGame([cat, ball], firstWord)
    game.place('C', 0)

    expect(game.place('C', 0)).toEqual([])
    expect(game.place('A', -1)).toEqual([])
    expect(game.place('A', 3)).toEqual([])
  })

  it('has spelled the word once every blank is filled, and waits for the next word', () => {
    const game = new SpellingGame([cat, ball], firstWord)
    game.place('C', 0)
    game.place('A', 1)

    expect(game.place('T', 2)).toEqual([
      { type: 'letterPlaced', letter: 'T', position: 2 },
      { type: 'wordSpelled', word: 'CAT', emoji: '🐱', sound: 'meow' },
    ])

    expect(game.snapshot()).toEqual({ phase: 'spelled', emoji: '🐱', blanks: ['C', 'A', 'T'], wordsSpelled: 1 })
    expect(game.place('X', 0)).toEqual([])
  })

  it('has no sound for a word that is not a noisy animal', () => {
    const game = new SpellingGame([ball], firstWord)
    game.place('B', 0)
    game.place('A', 1)
    game.place('L', 2)

    expect(game.place('L', 3)).toContainEqual({ type: 'wordSpelled', word: 'BALL', emoji: '⚽', sound: undefined })
  })

  it('brings the next word with fresh blanks', () => {
    const game = new SpellingGame([cat, ball], firstWord)
    spell(game, [cat, ball])

    game.nextWord()

    expect(game.snapshot()).toMatchObject({ phase: 'spelling', emoji: '⚽', blanks: [null, null, null, null], wordsSpelled: 1 })
  })

  it('does nothing if asked for the next word before this one is spelled', () => {
    const game = new SpellingGame([cat, ball], firstWord)

    game.nextWord()

    expect(game.snapshot()).toMatchObject({ emoji: '🐱', wordsSpelled: 0 })
  })

  it('starts with short words and works up to longer ones, however the dice fall', () => {
    const game = new SpellingGame([apple, ball, cat], firstWord)
    const lengths: number[] = []

    for (let i = 0; i < 3; i++) {
      lengths.push(game.snapshot().blanks.length)
      spell(game, [apple, ball, cat])
      game.nextWord()
    }

    expect(lengths).toEqual([3, 4, 5])
  })

  it('goes round the words again once it has used them all', () => {
    const game = new SpellingGame([cat, ball], firstWord)
    const seen: string[] = []

    for (let i = 0; i < 4; i++) {
      seen.push(game.snapshot().emoji)
      spell(game, [cat, ball])
      game.nextWord()
    }

    expect(seen).toEqual(['🐱', '⚽', '🐱', '⚽'])
  })
})

describe('WORDS', () => {
  it('are capital letters only, each word and picture used once', () => {
    for (const { spelling } of WORDS) expect(spelling).toMatch(/^[A-Z]{3,5}$/)
    expect(new Set(WORDS.map((word) => word.spelling)).size).toBe(WORDS.length)
    expect(new Set(WORDS.map((word) => word.emoji)).size).toBe(WORDS.length)
  })
})
