import { describe, expect, it } from 'vitest'
import { InMemoryBestScoreStore } from './InMemoryBestScoreStore'
import { recordFinalScore } from './bestScore'

describe('recording a final score', () => {
  it('makes the first score the best', () => {
    const store = new InMemoryBestScoreStore()

    expect(recordFinalScore(store, 4)).toEqual({ best: 4, isNewBest: true })
    expect(store.load()).toBe(4)
  })

  it('keeps the old best when the new score is lower', () => {
    const store = new InMemoryBestScoreStore(9)

    expect(recordFinalScore(store, 3)).toEqual({ best: 9, isNewBest: false })
    expect(store.load()).toBe(9)
  })

  it('does not call a tie a new best', () => {
    const store = new InMemoryBestScoreStore(5)

    expect(recordFinalScore(store, 5).isNewBest).toBe(false)
  })

  it('does not celebrate a score of zero', () => {
    const store = new InMemoryBestScoreStore()

    expect(recordFinalScore(store, 0).isNewBest).toBe(false)
  })
})
