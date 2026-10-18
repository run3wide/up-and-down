import { describe, expect, it } from 'vitest'
import { buildQuestion, mathQuiz } from './mathQuestions'
import type { MathQuestion } from './quiz'

function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TERM = /(\d+)(\p{Extended_Pictographic}|[a-z])/gu

/** Reads "2x + 1x + 3y" into { x: 3, y: 3 }, so tests can check the sums themselves. */
function totals(text: string): Record<string, number> {
  const result: Record<string, number> = {}
  for (const [, count, symbol] of text.matchAll(TERM)) result[symbol] = (result[symbol] ?? 0) + Number(count)
  return result
}

const termsIn = (text: string) => [...text.matchAll(TERM)].map(([, count, symbol]) => ({ count: Number(count), symbol }))
const correctOption = (question: MathQuestion) => question.options[question.correctIndex]

describe('every question', () => {
  it.each([1, 2, 3, 4, 5, 6, 9, 15])('is well formed at question %i', (number) => {
    for (let seed = 1; seed <= 40; seed++) {
      const question = buildQuestion(seeded(seed), number)

      expect(question.prompt).toMatch(/=$/)
      expect(question.options).toHaveLength(3)
      expect(new Set(question.options).size).toBe(3)
      expect(question.correctIndex).toBeGreaterThanOrEqual(0)
      expect(question.correctIndex).toBeLessThan(3)
      expect(question.explanation.length).toBeGreaterThan(0)
    }
  })

  it('has a correct answer that adds up like things and only like things', () => {
    for (let number = 1; number <= 12; number++) {
      for (let seed = 1; seed <= 60; seed++) {
        const question = buildQuestion(seeded(seed * 31 + number), number)

        expect(totals(correctOption(question))).toEqual(totals(question.prompt))
      }
    }
  })

  it('has wrong answers that really are wrong', () => {
    for (let number = 1; number <= 12; number++) {
      for (let seed = 1; seed <= 60; seed++) {
        const question = buildQuestion(seeded(seed * 17 + number), number)
        const right = totals(question.prompt)

        question.options.forEach((option, index) => {
          if (index !== question.correctIndex) expect(totals(option)).not.toEqual(right)
        })
      }
    }
  })

  it('does not always put the right answer in the same place', () => {
    const positions = new Set(Array.from({ length: 40 }, (_, seed) => buildQuestion(seeded(seed + 1), 1).correctIndex))

    expect(positions.size).toBeGreaterThan(1)
  })

  it('is the same question for the same random source', () => {
    expect(buildQuestion(seeded(9), 5)).toEqual(buildQuestion(seeded(9), 5))
  })
})

describe('the first questions are gentle', () => {
  it('start with pictures of fruit: the same fruit twice, small numbers', () => {
    for (const number of [1, 2]) {
      for (let seed = 1; seed <= 40; seed++) {
        const terms = termsIn(buildQuestion(seeded(seed), number).prompt)

        expect(terms).toHaveLength(2)
        expect(terms[0].symbol).toBe(terms[1].symbol)
        expect(terms[0].symbol).toMatch(/\p{Extended_Pictographic}/u)
        expect(terms[0].count + terms[1].count).toBeLessThanOrEqual(10)
      }
    }
  })

  it('then move on to letters, still just one kind of thing', () => {
    for (const number of [3, 4]) {
      for (let seed = 1; seed <= 40; seed++) {
        const terms = termsIn(buildQuestion(seeded(seed), number).prompt)

        expect(terms).toHaveLength(2)
        expect(terms[0].symbol).toBe(terms[1].symbol)
        expect(terms[0].symbol).toMatch(/[a-z]/)
      }
    }
  })

  it.each([1, 2, 3, 4])(
    'at question %i the wrong answers have the right number but the wrong thing: a bare number, or another thing',
    (number) => {
      for (let seed = 1; seed <= 40; seed++) {
        const question = buildQuestion(seeded(seed), number)
        const [{ symbol }] = termsIn(question.prompt)
        const rightNumber = Object.values(totals(question.prompt))[0]
        const wrong = question.options.filter((_, index) => index !== question.correctIndex)

        const bare = wrong.filter((option) => /^\d+$/.test(option))
        const otherThing = wrong.filter((option) => termsIn(option).length === 1 && termsIn(option)[0].symbol !== symbol)
        expect(bare).toEqual([String(rightNumber)])
        expect(otherThing).toHaveLength(1)
        expect(termsIn(otherThing[0])[0].count).toBe(rightNumber)
      }
    },
  )

  it('gives the right answer as the number with its own thing, e.g. 3x or 3 pineapples', () => {
    const question = buildQuestion(seeded(2), 1)
    const [{ symbol }] = termsIn(question.prompt)

    expect(termsIn(correctOption(question))[0].symbol).toBe(symbol)
  })
})

describe('later questions mix two kinds of thing', () => {
  const later = Array.from({ length: 80 }, (_, seed) => buildQuestion(seeded(seed + 1), 7))
  const mixed = later.filter((question) => Object.keys(totals(question.prompt)).length === 2)

  it('include some with two different things, which must be kept apart', () => {
    expect(mixed.length).toBeGreaterThan(10)
  })

  it('answer a mixed sum with one group per kind, and offer the lumped-together mistake', () => {
    for (const question of mixed) {
      const everything = Object.values(totals(question.prompt)).reduce((a, b) => a + b, 0)

      expect(termsIn(correctOption(question))).toHaveLength(2)
      const lumped = question.options.filter((option) => termsIn(option).length === 1 && termsIn(option)[0].count === everything)
      expect(lumped.length).toBeGreaterThan(0)
    }
  })

  it('say something about keeping the kinds apart', () => {
    for (const question of mixed) expect(question.explanation).toMatch(/same|together|apart|mix/i)
  })
})

describe('mathQuiz', () => {
  it('asks the question it is asked for', () => {
    const quiz = mathQuiz(seeded(4))

    expect(termsIn(quiz.ask(1).prompt)[0].symbol).toMatch(/\p{Extended_Pictographic}/u)
    expect(termsIn(quiz.ask(3).prompt)[0].symbol).toMatch(/[a-z]/)
  })
})
