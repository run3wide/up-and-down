export interface MathQuestion {
  /** The sum to solve, ending in "=", e.g. "2x + 6x =". */
  readonly prompt: string
  readonly options: readonly string[]
  readonly correctIndex: number
  /** Said after a right answer, to hammer home that only like things go together. */
  readonly explanation: string
}

/** Decides when the race stops for a question, and what it asks. */
export interface Quiz {
  /** Seconds of racing until the next question is due. */
  nextDelay(): number
  /** `questionNumber` starts at 1 and gets harder as it grows. */
  ask(questionNumber: number): MathQuestion
}
