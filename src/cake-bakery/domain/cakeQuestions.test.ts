import { describe, expect, it } from 'vitest'
import { cakeQuiz } from './cakeQuestions'
import type { MathQuestion } from '../../dino-race/domain/quiz'

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
const termsIn = (text: string) => [...text.matchAll(TERM)].map(([, count, symbol]) => ({ count: Number(count), symbol }))

function totals(text: string): Record<string, number> {
  const result: Record<string, number> = {}
  for (const { count, symbol } of termsIn(text)) result[symbol] = (result[symbol] ?? 0) + count
  return result
}

const correctOption = (question: MathQuestion) => question.options[question.correctIndex]

describe('cake questions', () => {
  it('are well formed at every step, with three different answers', () => {
    for (let number = 1; number <= 14; number++) {
      for (let seed = 1; seed <= 40; seed++) {
        const question = cakeQuiz(seeded(seed * 7 + number)).ask(number)

        expect(question.prompt).toMatch(/=$/)
        expect(new Set(question.options).size).toBe(3)
        expect(question.options[question.correctIndex]).toBeDefined()
      }
    }
  })

  it('have a right answer that adds up like things and only like things', () => {
    for (let number = 1; number <= 14; number++) {
      for (let seed = 1; seed <= 60; seed++) {
        const question = cakeQuiz(seeded(seed * 13 + number)).ask(number)

        expect(totals(correctOption(question))).toEqual(totals(question.prompt))
      }
    }
  })

  it('start with one kind of fruit or shape, never letters', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const { prompt } = cakeQuiz(seeded(seed)).ask(1)

      expect(prompt).not.toMatch(/\d[a-z]/)
      expect(new Set(termsIn(prompt).map((term) => term.symbol)).size).toBe(1)
    }
  })

  it('use shapes as well as fruit', () => {
    const symbols = new Set<string>()
    for (let seed = 1; seed <= 80; seed++) {
      for (const { symbol } of termsIn(cakeQuiz(seeded(seed)).ask(1).prompt)) symbols.add(symbol)
    }

    expect(symbols.size).toBeGreaterThan(5)
    expect(['⭐', '🔺', '🟦', '🟢'].some((shape) => symbols.has(shape))).toBe(true)
    expect(['🍍', '🍌', '🍇', '🍓', '🍎'].some((fruit) => symbols.has(fruit))).toBe(true)
  })

  it('reach letters and four-term sums like 1x + 2y + 3x + 1y once the baker is practised', () => {
    const lengths = new Set<number>()
    let sawLetters = false
    for (let seed = 1; seed <= 100; seed++) {
      const { prompt } = cakeQuiz(seeded(seed)).ask(9)
      lengths.add(termsIn(prompt).length)
      sawLetters ||= /\d[a-z]/.test(prompt)
    }

    expect(lengths.has(4)).toBe(true)
    expect(sawLetters).toBe(true)
  })
})
