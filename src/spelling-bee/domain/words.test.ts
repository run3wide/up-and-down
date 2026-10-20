import { describe, expect, it } from 'vitest'
import { DIFFICULTIES, LEVELS, WORDS } from './words'

const lengths = (difficulty: (typeof DIFFICULTIES)[number]) => LEVELS[difficulty].map((word) => word.spelling.length)

describe('the spelling levels', () => {
  it('goes from easy to medium to hard', () => {
    expect(DIFFICULTIES).toEqual(['easy', 'medium', 'hard'])
  })

  it('keeps the original three to five letter words as the easy level', () => {
    expect(LEVELS.easy).toBe(WORDS)
    expect(Math.min(...lengths('easy'))).toBe(3)
    expect(Math.max(...lengths('easy'))).toBe(5)
  })

  it('has six and seven letter words on medium', () => {
    expect(Math.min(...lengths('medium'))).toBe(6)
    expect(Math.max(...lengths('medium'))).toBe(7)
  })

  it('goes up to ten letters on hard, as long as watermelon and strawberry', () => {
    expect(Math.min(...lengths('hard'))).toBe(8)
    expect(Math.max(...lengths('hard'))).toBe(10)
    expect(LEVELS.hard.map((word) => word.spelling)).toEqual(expect.arrayContaining(['WATERMELON', 'STRAWBERRY']))
  })

  it.each(DIFFICULTIES)('has %s words that are only letters of the alphabet, with a picture each, and none twice', (difficulty) => {
    const words = LEVELS[difficulty]

    expect(words.length).toBeGreaterThanOrEqual(10)
    for (const word of words) expect(word.spelling).toMatch(/^[A-Z]+$/)
    expect(new Set(words.map((word) => word.spelling)).size).toBe(words.length)
    expect(new Set(words.map((word) => word.emoji)).size).toBe(words.length)
  })
})
