import type { Item, Kind } from './kinds'

export const MAX_LIVES = 5

const FIRST_BOARD_PAIRS = 3
const MOST_PAIRS = 6

export type Phase = 'playing' | 'cleared' | 'over'
export type CardState = 'down' | 'up' | 'matched'

export type MatchEvent =
  | { type: 'cardFlipped'; card: number }
  | { type: 'pairFound'; kind: string }
  | { type: 'pairMissed'; first: string; second: string }
  | { type: 'boardCleared' }
  | { type: 'gameOver' }

export interface CardSnapshot extends Item {
  readonly id: number
  readonly state: CardState
}

export interface MatchSnapshot {
  readonly phase: Phase
  readonly lives: number
  readonly boardsCleared: number
  readonly pairsFound: number
  readonly pairsTotal: number
  readonly cards: readonly CardSnapshot[]
}

interface Card extends Item {
  readonly kind: Kind
}

export class MatchGame {
  private readonly kinds: readonly Kind[]
  private readonly random: () => number
  private lives = MAX_LIVES
  private boardsCleared = 0
  private cleared = false
  private board: readonly Card[]
  private up: number[] = []
  private matched = new Set<number>()

  constructor(kinds: readonly Kind[], random: () => number) {
    this.kinds = kinds
    this.random = random
    this.board = this.deal()
  }

  flip(id: number): MatchEvent[] {
    if (this.lives === 0 || this.cleared || !this.isFaceDown(id)) return []
    if (this.up.length === 2) this.up = []
    this.up.push(id)
    const events: MatchEvent[] = [{ type: 'cardFlipped', card: id }]
    if (this.up.length === 2) events.push(...this.judgePair())
    return events
  }

  nextBoard() {
    if (!this.cleared) return
    this.lives = Math.min(this.lives + 1, MAX_LIVES)
    this.board = this.deal()
  }

  snapshot(): MatchSnapshot {
    return {
      phase: this.phase(),
      lives: this.lives,
      boardsCleared: this.boardsCleared,
      pairsFound: this.matched.size / 2,
      pairsTotal: this.board.length / 2,
      cards: this.board.map(({ name, face }, id) => ({ id, name, face, state: this.stateOf(id) })),
    }
  }

  private judgePair(): MatchEvent[] {
    const [first, second] = this.up.map((id) => this.board[id])
    if (first.kind !== second.kind) return this.missPair(first, second)
    this.up.forEach((id) => this.matched.add(id))
    this.up = []
    const events: MatchEvent[] = [{ type: 'pairFound', kind: first.kind.plural }]
    if (this.matched.size === this.board.length) events.push(this.clearBoard())
    return events
  }

  private missPair(first: Card, second: Card): MatchEvent[] {
    this.lives -= 1
    const events: MatchEvent[] = [{ type: 'pairMissed', first: first.name, second: second.name }]
    if (this.lives === 0) events.push({ type: 'gameOver' })
    return events
  }

  private clearBoard(): MatchEvent {
    this.cleared = true
    this.boardsCleared += 1
    return { type: 'boardCleared' }
  }

  private deal(): Card[] {
    this.cleared = false
    this.up = []
    this.matched = new Set()
    const pairs = Math.min(FIRST_BOARD_PAIRS + this.boardsCleared, MOST_PAIRS, this.kinds.length)
    const cards = this.shuffled(this.kinds)
      .slice(0, pairs)
      .flatMap((kind) => this.shuffled(kind.items).slice(0, 2).map((item) => ({ ...item, kind })))
    return this.shuffled(cards)
  }

  private phase(): Phase {
    if (this.lives === 0) return 'over'
    return this.cleared ? 'cleared' : 'playing'
  }

  private isFaceDown(id: number): boolean {
    return id >= 0 && id < this.board.length && this.stateOf(id) === 'down'
  }

  private stateOf(id: number): CardState {
    if (this.matched.has(id)) return 'matched'
    return this.up.includes(id) ? 'up' : 'down'
  }

  private shuffled<T>(items: readonly T[]): T[] {
    const result = [...items]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}
