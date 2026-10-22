import type { MathQuestion, Quiz } from '../../dino-race/domain/quiz'
import { CHOICES, STEPS, type Choice, type Step } from './ingredients'

/** Each cake baked moves the first question this far up the quiz's ladder. */
const QUESTIONS_GAINED_PER_CAKE = 2

export type Phase = 'question' | 'choosing' | 'baked'

export type BakeEvent =
  | { type: 'answeredRight'; explanation: string }
  | { type: 'wrongAnswer'; option: number }
  | { type: 'chosen'; step: Step; choice: Choice }
  | { type: 'cakeBaked' }

export type Cake = Partial<Record<Step, Choice>>

export interface BakeSnapshot {
  readonly phase: Phase
  readonly step: Step
  readonly question: MathQuestion
  /** Options already tried and wrong for this question. */
  readonly wrongOptions: readonly number[]
  /** What can be picked: empty until the question is answered. */
  readonly choices: readonly Choice[]
  readonly cake: Cake
  readonly cakesBaked: number
}

/** A cake is built one step at a time; each step is unlocked by answering a like-things sum. Nothing is ever lost. */
export class BakeGame {
  private readonly quiz: Quiz
  private cakesBaked = 0
  private stepIndex = 0
  private cake: Cake = {}
  private question: MathQuestion
  private wrongOptions: number[] = []
  private answered = false

  constructor(quiz: Quiz) {
    this.quiz = quiz
    this.question = this.askQuestion()
  }

  answer(option: number): BakeEvent[] {
    if (this.phase() !== 'question' || !this.question.options[option]) return []
    if (option !== this.question.correctIndex) {
      if (!this.wrongOptions.includes(option)) this.wrongOptions.push(option)
      return [{ type: 'wrongAnswer', option }]
    }
    this.answered = true
    return [{ type: 'answeredRight', explanation: this.question.explanation }]
  }

  choose(name: string): BakeEvent[] {
    const choice = this.phase() === 'choosing' ? CHOICES[this.step()].find((candidate) => candidate.name === name) : undefined
    if (!choice) return []
    const step = this.step()
    this.cake = { ...this.cake, [step]: choice }
    this.stepIndex += 1
    const events: BakeEvent[] = [{ type: 'chosen', step, choice }]
    if (this.stepIndex === STEPS.length) {
      this.cakesBaked += 1
      events.push({ type: 'cakeBaked' })
    } else {
      this.question = this.askQuestion()
    }
    return events
  }

  nextCake(): void {
    if (this.phase() !== 'baked') return
    this.stepIndex = 0
    this.cake = {}
    this.question = this.askQuestion()
  }

  snapshot(): BakeSnapshot {
    const phase = this.phase()
    return {
      phase,
      step: this.step(),
      question: this.question,
      wrongOptions: this.wrongOptions,
      choices: phase === 'choosing' ? CHOICES[this.step()] : [],
      cake: this.cake,
      cakesBaked: this.cakesBaked,
    }
  }

  private phase(): Phase {
    if (this.stepIndex === STEPS.length) return 'baked'
    return this.answered ? 'choosing' : 'question'
  }

  private step(): Step {
    return STEPS[Math.min(this.stepIndex, STEPS.length - 1)]
  }

  private askQuestion(): MathQuestion {
    this.answered = false
    this.wrongOptions = []
    return this.quiz.ask(this.cakesBaked * QUESTIONS_GAINED_PER_CAKE + this.stepIndex + 1)
  }
}
