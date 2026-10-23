import { describe, expect, it } from 'vitest'
import { groupQuiz } from './groupQuestions'

function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const symbolsOf = (terms: readonly { symbol: string }[]) => new Set(terms.map((term) => term.symbol))

describe('group sums', () => {
  it('start with three terms of two kinds, like 3x + 2y + 2x, in fruit or shapes', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const terms = groupQuiz(seeded(seed)).ask(1)

      expect(terms).toHaveLength(3)
      expect(symbolsOf(terms).size).toBe(2)
      expect(terms.every((term) => !/^[a-z]$/.test(term.symbol))).toBe(true)
    }
  })

  it('always have at least one kind that appears twice, so there is something to group', () => {
    for (let number = 1; number <= 14; number++) {
      for (let seed = 1; seed <= 40; seed++) {
        const terms = groupQuiz(seeded(seed * 5 + number)).ask(number)

        expect(terms.length).toBeGreaterThan(symbolsOf(terms).size)
      }
    }
  })

  it('keep every count between 1 and 5', () => {
    for (let number = 1; number <= 14; number++) {
      for (const { count } of groupQuiz(seeded(number)).ask(number)) {
        expect(count).toBeGreaterThanOrEqual(1)
        expect(count).toBeLessThanOrEqual(5)
      }
    }
  })

  it('grow to letters, four terms and then three kinds in five terms', () => {
    const quiz = groupQuiz(seeded(3))

    expect(quiz.ask(5).every((term) => /^[a-z]$/.test(term.symbol))).toBe(true)
    expect(quiz.ask(7)).toHaveLength(4)
    const longest = quiz.ask(9)
    expect(longest).toHaveLength(5)
    expect(symbolsOf(longest).size).toBe(3)
  })
})
