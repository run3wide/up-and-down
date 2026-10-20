import type { Clue, HidingPlace, Mystery, Thing } from './mysteries'

export type CluesPhase = 'looking' | 'thinking' | 'solved'

export type PlaceState = 'hidden' | 'empty' | 'clue'

export type CluesEvent =
  | { type: 'clueFound'; clue: Clue; number: number }
  | { type: 'nothingHere'; place: HidingPlace }
  | { type: 'allCluesFound' }
  | { type: 'wrongGuess'; choice: Thing }
  | { type: 'solved'; answer: Thing }

export interface CluesSnapshot {
  readonly phase: CluesPhase
  readonly question: string
  readonly places: readonly { readonly place: HidingPlace; readonly state: PlaceState }[]
  readonly cluesFound: readonly Clue[]
  /** Only on show once all the clues are found. */
  readonly choices: readonly Thing[]
  /** Only known once the mystery is solved. */
  readonly answer: Thing | null
  /** Mysteries solved: the score. */
  readonly solved: number
}

export class DinoCluesGame {
  private readonly mysteries: readonly Mystery[]
  private readonly places: readonly HidingPlace[]
  private readonly random: () => number
  private deck: Mystery[] = []
  private mystery: Mystery
  private choices: Thing[] = []
  /** The place each clue is hidden in, in the order the clues are found. */
  private cluePlaces: number[] = []
  private looked = new Set<number>()
  private cluesFound: Clue[] = []
  private phase: CluesPhase = 'looking'
  private solved = 0

  constructor(mysteries: readonly Mystery[], places: readonly HidingPlace[], random: () => number) {
    this.mysteries = mysteries
    this.places = places
    this.random = random
    this.mystery = this.takeMystery()
    this.setUp()
  }

  look(place: number): CluesEvent[] {
    if (this.phase !== 'looking' || place < 0 || place >= this.places.length || this.looked.has(place)) return []
    this.looked.add(place)
    const clueNumber = this.cluePlaces.indexOf(place)
    if (clueNumber === -1) return [{ type: 'nothingHere', place: this.places[place] }]
    const clue = this.mystery.clues[clueNumber]
    this.cluesFound.push(clue)
    const events: CluesEvent[] = [{ type: 'clueFound', clue, number: this.cluesFound.length }]
    if (this.cluesFound.length === this.mystery.clues.length) {
      this.phase = 'thinking'
      events.push({ type: 'allCluesFound' })
    }
    return events
  }

  /** A wrong guess costs nothing: Dino just thinks again. */
  guess(choice: number): CluesEvent[] {
    if (this.phase !== 'thinking' || choice < 0 || choice >= this.choices.length) return []
    const guessed = this.choices[choice]
    if (guessed !== this.mystery.answer) return [{ type: 'wrongGuess', choice: guessed }]
    this.phase = 'solved'
    this.solved += 1
    return [{ type: 'solved', answer: guessed }]
  }

  nextMystery(): void {
    if (this.phase !== 'solved') return
    this.mystery = this.takeMystery()
    this.setUp()
  }

  snapshot(): CluesSnapshot {
    return {
      phase: this.phase,
      question: this.mystery.question,
      places: this.places.map((place, index) => ({ place, state: this.stateOf(index) })),
      cluesFound: [...this.cluesFound],
      choices: this.phase === 'looking' ? [] : this.choices,
      answer: this.phase === 'solved' ? this.mystery.answer : null,
      solved: this.solved,
    }
  }

  private stateOf(place: number): PlaceState {
    if (!this.looked.has(place)) return 'hidden'
    return this.cluePlaces.includes(place) ? 'clue' : 'empty'
  }

  private setUp(): void {
    this.phase = 'looking'
    this.looked = new Set()
    this.cluesFound = []
    this.cluePlaces = this.shuffled(this.places.map((_, index) => index)).slice(0, this.mystery.clues.length)
    this.choices = this.shuffled(this.mystery.choices)
  }

  private takeMystery(): Mystery {
    if (this.deck.length === 0) this.deck = this.freshDeck()
    return this.deck.shift()!
  }

  /** The first card of a new deck is never the one just solved. */
  private freshDeck(): Mystery[] {
    const deck = this.shuffled(this.mysteries)
    const justSolved = this.mystery
    if (deck.length > 1 && deck[0] === justSolved) [deck[0], deck[1]] = [deck[1], deck[0]]
    return deck
  }

  private shuffled<T>(items: readonly T[]): T[] {
    const result = [...items]
    for (let i = 0; i < result.length - 1; i++) {
      const j = i + Math.floor(this.random() * (result.length - i))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}
