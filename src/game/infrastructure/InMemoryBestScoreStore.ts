import type { BestScoreStore } from '../application/bestScore'

export class InMemoryBestScoreStore implements BestScoreStore {
  private best: number

  constructor(best = 0) {
    this.best = best
  }

  load(): number {
    return this.best
  }

  save(score: number): void {
    this.best = score
  }
}
