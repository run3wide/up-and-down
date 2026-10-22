import { CHOICES, STEPS, type Choice, type Step } from './ingredients'
import { matchesAnswer, type Sum, type SumQuiz, type Term } from './sum'

/** Each cake baked moves the first sum this far up the quiz's ladder. */
const QUESTIONS_GAINED_PER_CAKE = 2

export type Phase = 'question' | 'choosing' | 'baked'

export type Tile =
  | { readonly id: string; readonly kind: 'count'; readonly count: number }
  | { readonly id: string; readonly kind: 'symbol'; readonly symbol: string }

export type BakeEvent =
  | { type: 'answeredRight'; explanation: string }
  | { type: 'wrongAnswer' }
  | { type: 'chosen'; step: Step; choice: Choice }
  | { type: 'cakeBaked' }

export type Cake = Partial<Record<Step, Choice>>

export interface BakeSnapshot {
  readonly phase: Phase
  readonly step: Step
  readonly prompt: string
  /** The blanks of the answer, in order: a number and a symbol for each kind of thing. `null` is empty. */
  readonly slots: readonly (Tile | null)[]
  /** Tiles not in a blank. */
  readonly tray: readonly Tile[]
  /** What can be picked: empty until the sum is answered. */
  readonly choices: readonly Choice[]
  readonly cake: Cake
  readonly cakesBaked: number
}

const slotWants = (slot: number): Tile['kind'] => (slot % 2 === 0 ? 'count' : 'symbol')

/** A cake is built one step at a time; each step is unlocked by building the answer to a like-things sum in blanks. Nothing is ever lost. */
export class BakeGame {
  private readonly quiz: SumQuiz
  private cakesBaked = 0
  private stepIndex = 0
  private cake: Cake = {}
  private sum: Sum
  private tiles: readonly Tile[] = []
  private slots: (string | null)[] = []
  private solved = false

  constructor(quiz: SumQuiz) {
    this.quiz = quiz
    this.sum = this.askSum()
  }

  /** Puts a tile in a blank. A tile already there goes back to the tray; a tile in another blank moves. */
  place(tileId: string, slot: number): BakeEvent[] {
    const tile = this.tiles.find((candidate) => candidate.id === tileId)
    if (this.phase() !== 'question' || !tile || slot < 0 || slot >= this.slots.length || tile.kind !== slotWants(slot)) return []
    const wasAt = this.slots.indexOf(tileId)
    if (wasAt !== -1) this.slots[wasAt] = null
    this.slots[slot] = tileId
    return this.slots.every((filled) => filled !== null) ? this.check() : []
  }

  takeBack(slot: number): void {
    if (this.phase() === 'question' && slot >= 0 && slot < this.slots.length) this.slots[slot] = null
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
      this.sum = this.askSum()
    }
    return events
  }

  nextCake(): void {
    if (this.phase() !== 'baked') return
    this.stepIndex = 0
    this.cake = {}
    this.sum = this.askSum()
  }

  snapshot(): BakeSnapshot {
    const phase = this.phase()
    return {
      phase,
      step: this.step(),
      prompt: this.sum.prompt,
      slots: this.slots.map((id) => this.tiles.find((tile) => tile.id === id) ?? null),
      tray: this.tiles.filter((tile) => !this.slots.includes(tile.id)),
      choices: phase === 'choosing' ? CHOICES[this.step()] : [],
      cake: this.cake,
      cakesBaked: this.cakesBaked,
    }
  }

  private check(): BakeEvent[] {
    if (!matchesAnswer(this.filledTerms(), this.sum.answer)) {
      this.slots = this.slots.map(() => null)
      return [{ type: 'wrongAnswer' }]
    }
    this.solved = true
    return [{ type: 'answeredRight', explanation: this.sum.explanation }]
  }

  private filledTerms(): Term[] {
    return this.sum.answer.map((_, group) => {
      const count = this.tiles.find((tile) => tile.id === this.slots[group * 2])
      const symbol = this.tiles.find((tile) => tile.id === this.slots[group * 2 + 1])
      return { count: count?.kind === 'count' ? count.count : NaN, symbol: symbol?.kind === 'symbol' ? symbol.symbol : '' }
    })
  }

  private phase(): Phase {
    if (this.stepIndex === STEPS.length) return 'baked'
    return this.solved ? 'choosing' : 'question'
  }

  private step(): Step {
    return STEPS[Math.min(this.stepIndex, STEPS.length - 1)]
  }

  private askSum(): Sum {
    this.solved = false
    const sum = this.quiz.ask(this.cakesBaked * QUESTIONS_GAINED_PER_CAKE + this.stepIndex + 1)
    this.tiles = [
      ...sum.counts.map((count, index): Tile => ({ id: `count-${index}`, kind: 'count', count })),
      ...sum.symbols.map((symbol, index): Tile => ({ id: `symbol-${index}`, kind: 'symbol', symbol })),
    ]
    this.slots = sum.answer.flatMap(() => [null, null])
    return sum
  }
}
