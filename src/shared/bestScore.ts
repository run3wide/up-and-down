export interface BestScoreStore {
  load(): number
  save(score: number): void
}

export interface BestScoreResult {
  readonly best: number
  readonly isNewBest: boolean
}

export function recordFinalScore(store: BestScoreStore, score: number): BestScoreResult {
  const previousBest = store.load()
  if (score <= previousBest) return { best: previousBest, isNewBest: false }
  store.save(score)
  return { best: score, isNewBest: true }
}
