import type { BestScoreStore } from './bestScore'

/** Storage can be blocked (private windows, strict settings); the game must still play. */
export class LocalStorageBestScoreStore implements BestScoreStore {
  private readonly key: string

  constructor(key: string) {
    this.key = key
  }

  load(): number {
    try {
      const score = Number.parseInt(localStorage.getItem(this.key) ?? '', 10)
      return Number.isInteger(score) && score > 0 ? score : 0
    } catch {
      return 0
    }
  }

  save(score: number): void {
    try {
      localStorage.setItem(this.key, String(score))
    } catch {
      // Best score just won't persist.
    }
  }
}
