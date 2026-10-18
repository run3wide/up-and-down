import type { BestScoreStore } from '../application/bestScore'

const KEY = 'up-and-down:best-score'

/** Storage can be blocked (private windows, strict settings); the game must still play. */
export class LocalStorageBestScoreStore implements BestScoreStore {
  load(): number {
    try {
      const score = Number.parseInt(localStorage.getItem(KEY) ?? '', 10)
      return Number.isInteger(score) && score > 0 ? score : 0
    } catch {
      return 0
    }
  }

  save(score: number): void {
    try {
      localStorage.setItem(KEY, String(score))
    } catch {
      // Best score just won't persist.
    }
  }
}
