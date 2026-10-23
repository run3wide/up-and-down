import { show, type Term } from '../../shared/likeThings'

export interface GroupQuiz {
  /** The terms of the sum, in the order they are written; `questionNumber` starts at 1 and gets harder as it grows. */
  ask(questionNumber: number): readonly Term[]
}

export type Phase = 'sorting' | 'grouped'

export type GroupEvent =
  | { type: 'chipSorted'; chip: number; bin: string }
  | { type: 'wrongBin'; chip: number; bin: string }
  | { type: 'binFull'; bin: string; equation: string }
  | { type: 'allGrouped'; answer: string }

export interface Chip {
  readonly id: number
  readonly term: Term
}

export interface Bin {
  readonly symbol: string
  readonly chips: readonly Chip[]
  /** "3x + 2x = 5x" once every chip of this kind is in; null before. */
  readonly equation: string | null
}

export interface GroupSnapshot {
  readonly phase: Phase
  readonly prompt: string
  readonly pile: readonly Chip[]
  readonly bins: readonly Bin[]
  /** "5x + 2y" once everything is sorted. */
  readonly answer: string | null
  readonly grouped: number
}

/** Like things are moved into their own bins; nothing can be lost, and a wrong bin just sends the chip back. */
export class GroupGame {
  private readonly quiz: GroupQuiz
  private grouped = 0
  private chips: readonly Chip[] = []
  private sortedInto = new Map<number, string>()

  constructor(quiz: GroupQuiz) {
    this.quiz = quiz
    this.startSum()
  }

  move(chipId: number, bin: string): GroupEvent[] {
    const chip = this.chips.find((candidate) => candidate.id === chipId)
    if (!chip || this.phase() !== 'sorting' || this.sortedInto.has(chipId) || !this.symbols().includes(bin)) return []
    if (chip.term.symbol !== bin) return [{ type: 'wrongBin', chip: chipId, bin }]
    this.sortedInto.set(chipId, bin)
    const events: GroupEvent[] = [{ type: 'chipSorted', chip: chipId, bin }]
    const full = this.binOf(bin)
    if (full.equation) events.push({ type: 'binFull', bin, equation: full.equation })
    if (this.phase() === 'grouped') {
      this.grouped += 1
      events.push({ type: 'allGrouped', answer: this.answer()! })
    }
    return events
  }

  nextSum(): void {
    if (this.phase() === 'grouped') this.startSum()
  }

  snapshot(): GroupSnapshot {
    return {
      phase: this.phase(),
      prompt: this.chips.map((chip) => show(chip.term)).join(' + '),
      pile: this.chips.filter((chip) => !this.sortedInto.has(chip.id)),
      bins: this.symbols().map((symbol) => this.binOf(symbol)),
      answer: this.answer(),
      grouped: this.grouped,
    }
  }

  private phase(): Phase {
    return this.sortedInto.size === this.chips.length ? 'grouped' : 'sorting'
  }

  private symbols(): string[] {
    return [...new Set(this.chips.map((chip) => chip.term.symbol))]
  }

  private binOf(symbol: string): Bin {
    const own = this.chips.filter((chip) => chip.term.symbol === symbol)
    const inBin = own.filter((chip) => this.sortedInto.get(chip.id) === symbol)
    return { symbol, chips: inBin, equation: inBin.length === own.length ? equationFor(inBin) : null }
  }

  private answer(): string | null {
    if (this.phase() !== 'grouped') return null
    return this.symbols().map((symbol) => show({ symbol, count: total(this.binOf(symbol).chips) })).join(' + ')
  }

  private startSum(): void {
    this.chips = this.quiz.ask(this.grouped + 1).map((term, id) => ({ id, term }))
    this.sortedInto = new Map()
  }
}

const total = (chips: readonly Chip[]): number => chips.reduce((sum, chip) => sum + chip.term.count, 0)

function equationFor(chips: readonly Chip[]): string {
  const symbol = chips[0].term.symbol
  const answer = show({ symbol, count: total(chips) })
  return chips.length === 1 ? answer : `${chips.map((chip) => show(chip.term)).join(' + ')} = ${answer}`
}
