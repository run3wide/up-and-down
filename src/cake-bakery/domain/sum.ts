import type { Term } from '../../shared/likeThings'

export type { Term }

/** A like-things sum whose answer the player builds from tiles. */
export interface Sum {
  /** The sum to solve, ending in "=", e.g. "1x + 2y + 3x + 1y =". */
  readonly prompt: string
  /** The answer with like things together, e.g. 4x and 3y. Their order does not matter. */
  readonly answer: readonly Term[]
  /** The number tiles on offer: those the answer needs plus a few tempting wrong ones. */
  readonly counts: readonly number[]
  /** The symbol tiles on offer, likewise. */
  readonly symbols: readonly string[]
  /** Said after a right answer, to hammer home that only like things go together. */
  readonly explanation: string
}

/** Decides what the sum at each step of the cake asks. */
export interface SumQuiz {
  /** `questionNumber` starts at 1 and gets harder as it grows. */
  ask(questionNumber: number): Sum
}

/** 3x + 1y is the same answer as 1y + 3x: only which terms there are matters, not where they sit. */
export function matchesAnswer(filled: readonly Term[], answer: readonly Term[]): boolean {
  if (filled.length !== answer.length) return false
  const unmatched = [...answer]
  for (const term of filled) {
    const found = unmatched.findIndex((candidate) => candidate.count === term.count && candidate.symbol === term.symbol)
    if (found === -1) return false
    unmatched.splice(found, 1)
  }
  return true
}
