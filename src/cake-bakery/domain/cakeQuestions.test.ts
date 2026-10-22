import { describe, expect, it } from 'vitest'
import { cakeQuiz } from './cakeQuestions'
import type { Sum, Term } from './sum'

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
const termsIn = (text: string): Term[] => [...text.matchAll(TERM)].map(([, count, symbol]) => ({ count: Number(count), symbol }))

function totals(terms: readonly Term[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const { count, symbol } of terms) result[symbol] = (result[symbol] ?? 0) + count
  return result
}

const everySum = (check: (sum: Sum, number: number) => void) => {
  for (let number = 1; number <= 14; number++) {
    for (let seed = 1; seed <= 50; seed++) check(cakeQuiz(seeded(seed * 17 + number)).ask(number), number)
  }
}

describe('cake sums', () => {
  it('have an answer that adds up like things and only like things', () => {
    everySum((sum) => {
      expect(totals(sum.answer)).toEqual(totals(termsIn(sum.prompt)))
      expect(sum.answer.length).toBe(new Set(termsIn(sum.prompt).map((term) => term.symbol)).size)
    })
  })

  it('end in "=" and need at least one blank filling', () => {
    everySum((sum) => {
      expect(sum.prompt).toMatch(/=$/)
      expect(sum.answer.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('offer every tile the answer needs, plus some that are wrong', () => {
    everySum((sum) => {
      const spareCounts = [...sum.counts]
      for (const { count } of sum.answer) {
        const at = spareCounts.indexOf(count)
        expect(at).toBeGreaterThanOrEqual(0)
        spareCounts.splice(at, 1)
      }
      expect(spareCounts.length).toBeGreaterThanOrEqual(1)
      for (const { symbol } of sum.answer) expect(sum.symbols).toContain(symbol)
      expect(sum.symbols.length).toBeGreaterThan(sum.answer.length)
      expect(new Set(sum.symbols).size).toBe(sum.symbols.length)
    })
  })

  it('never offer the answer as a wrong tile by accident: the spare numbers differ from the needed ones', () => {
    everySum((sum) => {
      const needed = new Set(sum.answer.map((term) => term.count))
      const spare = [...sum.counts]
      for (const { count } of sum.answer) spare.splice(spare.indexOf(count), 1)
      for (const count of spare) expect(needed.has(count)).toBe(false)
    })
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
