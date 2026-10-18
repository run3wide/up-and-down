export interface Difficulty {
  readonly launchSpeed: number
  readonly maxDrift: number
}

const SCORE_AT_FULL_DIFFICULTY = 25
const GENTLE: Difficulty = { launchSpeed: 70, maxDrift: 8 }
const HARDEST: Difficulty = { launchSpeed: 100, maxDrift: 30 }

export function difficultyFor(score: number): Difficulty {
  const progress = Math.min(score / SCORE_AT_FULL_DIFFICULTY, 1)
  return {
    launchSpeed: lerp(GENTLE.launchSpeed, HARDEST.launchSpeed, progress),
    maxDrift: lerp(GENTLE.maxDrift, HARDEST.maxDrift, progress),
  }
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}
