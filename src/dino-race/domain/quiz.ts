export interface MathQuestion {
  /** The sum to solve, ending in "=", e.g. "2x + 6x =". */
  readonly prompt: string
  readonly options: readonly string[]
  readonly correctIndex: number
  /** Said after a right answer, to hammer home that only like things go together. */
  readonly explanation: string
}

/** Decides what the brain break at the start of the race asks. */
export interface Quiz {
  /** `questionNumber` starts at 1 and gets harder as it grows. */
  ask(questionNumber: number): MathQuestion
}
