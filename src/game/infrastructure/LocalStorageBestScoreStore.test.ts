import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocalStorageBestScoreStore } from './LocalStorageBestScoreStore'

describe('LocalStorageBestScoreStore', () => {
  beforeEach(() => localStorage.clear())

  it('remembers the best score between visits', () => {
    new LocalStorageBestScoreStore().save(12)

    expect(new LocalStorageBestScoreStore().load()).toBe(12)
  })

  it('starts at zero', () => {
    expect(new LocalStorageBestScoreStore().load()).toBe(0)
  })

  it('ignores junk left in storage', () => {
    localStorage.setItem('up-and-down:best-score', 'banana')

    expect(new LocalStorageBestScoreStore().load()).toBe(0)
  })

  it('carries on when storage is unavailable, such as in a private window', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const store = new LocalStorageBestScoreStore()

    expect(store.load()).toBe(0)
    expect(() => store.save(3)).not.toThrow()
    vi.restoreAllMocks()
  })
})
