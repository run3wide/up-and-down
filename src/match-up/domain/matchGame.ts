import type { Item, Kind } from './kinds'

/** Every board is a 5x5 square: 12 pairs and one lucky star in the middle, which is already face up and never needs a partner. */
const PAIRS_PER_BOARD = 12
const STAR_POSITION = 12
const LUCKY_STAR: Item = { name: 'Lucky star', face: '⭐' }

export type Phase = 'playing' | 'cleared'
export type CardState = 'down' | 'up' | 'matched'

export type MatchEvent =
  | { type: 'cardFlipped'; card: number }
  | { type: 'pairFound'; kind: string }
  | { type: 'pairMissed'; first: string; second: string }
  | { type: 'boardCleared' }

export interface CardSnapshot extends Item {
  readonly id: number
  readonly state: CardState
}

export interface MatchSnapshot {
  readonly phase: Phase
  readonly boardsCleared: number
  readonly pairsFound: number
  readonly pairsTotal: number
  readonly cards: readonly CardSnapshot[]
}

interface Card extends Item {
  /** The lucky star has no kind. */
  readonly kind: Kind | null
}

export class MatchGame {
  private readonly kinds: readonly Kind[]
  private readonly random: () => number
  private boardsCleared = 0
  private cleared = false
  private board: readonly Card[]
  private up: number[] = []
  private matched = new Set<number>()

  constructor(kinds: readonly Kind[], random: () => number) {
    if (kinds.length < PAIRS_PER_BOARD) throw new Error(`A board needs ${PAIRS_PER_BOARD} kinds, got ${kinds.length}`)
    this.kinds = kinds
    this.random = random
    this.board = this.deal()
  }

  flip(id: number): MatchEvent[] {
    if (this.cleared || !this.isFaceDown(id)) return []
    if (this.up.length === 2) this.up = []
    this.up.push(id)
    const events: MatchEvent[] = [{ type: 'cardFlipped', card: id }]
    if (this.up.length === 2) events.push(...this.judgePair())
    return events
  }

  /** Turns a pair that did not match back over; a lone flipped card stays. */
  turnBackMissed() {
    if (this.up.length === 2) this.up = []
  }

  nextBoard() {
    if (!this.cleared) return
    this.board = this.deal()
  }

  snapshot(): MatchSnapshot {
    return {
      phase: this.phase(),
      boardsCleared: this.boardsCleared,
      pairsFound: (this.matched.size - 1) / 2,
      pairsTotal: PAIRS_PER_BOARD,
      cards: this.board.map(({ name, face }, id) => ({ id, name, face, state: this.stateOf(id) })),
    }
  }

  private judgePair(): MatchEvent[] {
    const [first, second] = this.up.map((id) => this.board[id])
    if (first.kind !== second.kind) return this.missPair(first, second)
    this.up.forEach((id) => this.matched.add(id))
    this.up = []
    const events: MatchEvent[] = [{ type: 'pairFound', kind: first.kind!.plural }]
    if (this.matched.size === this.board.length) events.push(this.clearBoard())
    return events
  }

  private missPair(first: Card, second: Card): MatchEvent[] {
    return [{ type: 'pairMissed', first: first.name, second: second.name }]
  }

  private clearBoard(): MatchEvent {
    this.cleared = true
    this.boardsCleared += 1
    return { type: 'boardCleared' }
  }

  private deal(): Card[] {
    this.cleared = false
    this.up = []
    this.matched = new Set([STAR_POSITION])
    const cards: Card[] = this.shuffled(
      this.shuffled(this.kinds)
        .slice(0, PAIRS_PER_BOARD)
        .flatMap((kind) => this.shuffled(kind.items).slice(0, 2).map((item) => ({ ...item, kind }))),
    )
    return cards.toSpliced(STAR_POSITION, 0, { ...LUCKY_STAR, kind: null })
  }

  private phase(): Phase {
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
