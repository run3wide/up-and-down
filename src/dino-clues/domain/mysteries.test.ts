import { describe, expect, it } from 'vitest'
import { HIDING_PLACES, MYSTERIES } from './mysteries'

describe('the mysteries', () => {
  it('has plenty to solve', () => {
    expect(MYSTERIES.length).toBeGreaterThanOrEqual(12)
  })

  it.each(MYSTERIES.map((mystery) => [mystery.answer.name, mystery] as const))('has three clues and three choices that include the answer (%s)', (_name, mystery) => {
    expect(mystery.clues).toHaveLength(3)
    expect(mystery.choices).toHaveLength(3)
    expect(mystery.choices).toContain(mystery.answer)
    expect(new Set(mystery.choices.map((choice) => choice.name)).size).toBe(3)
    expect(new Set(mystery.choices.map((choice) => choice.emoji)).size).toBe(3)
  })

  it('asks every mystery a question of its own, with its answer not given away by the question', () => {
    expect(new Set(MYSTERIES.map((mystery) => mystery.answer.name)).size).toBe(MYSTERIES.length)
    for (const mystery of MYSTERIES) {
      expect(mystery.question).toMatch(/\?$/)
      expect(mystery.question.toLowerCase()).not.toContain(mystery.answer.name.toLowerCase())
    }
  })

  it('never says the answer in a clue, which would be no fun', () => {
    for (const mystery of MYSTERIES)
      for (const clue of mystery.clues) expect(clue.text.toLowerCase()).not.toContain(mystery.answer.name.toLowerCase())
  })

  it('has more places to look than clues to find', () => {
    expect(HIDING_PLACES.length).toBeGreaterThan(3)
    expect(new Set(HIDING_PLACES.map((place) => place.name)).size).toBe(HIDING_PLACES.length)
  })
})
