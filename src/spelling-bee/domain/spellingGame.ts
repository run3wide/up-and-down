import type { SoundEffect } from '../../shared/sound/SoundPlayer'
import type { Word } from './words'

export type Phase = 'spelling' | 'spelled'

export type SpellingEvent =
  | { type: 'letterPlaced'; letter: string; position: number }
  | { type: 'wrongLetter'; letter: string; position: number }
  | { type: 'wordSpelled'; word: string; emoji: string; sound: SoundEffect | undefined }

export interface SpellingSnapshot {
  readonly phase: Phase
  readonly emoji: string
  /** One entry per letter of the word: the letter that is in, or null while it is still a blank. */
  readonly blanks: readonly (string | null)[]
  readonly wordsSpelled: number
}

export class SpellingGame {
  private readonly words: readonly Word[]
  private readonly random: () => number
  private wordsSpelled = 0
  private deck: Word[] = []
  private word: Word
  private blanks: (string | null)[]

  constructor(words: readonly Word[], random: () => number) {
    this.words = words
    this.random = random
    this.word = this.takeWord()
    this.blanks = this.emptyBlanks()
  }

  /** A wrong letter costs nothing: it is simply sent back and the blank stays empty. */
  place(letter: string, position: number): SpellingEvent[] {
    if (this.isSpelled() || this.blanks[position] !== null) return []
    if (this.word.spelling[position] !== letter) return [{ type: 'wrongLetter', letter, position }]
    this.blanks[position] = letter
    const events: SpellingEvent[] = [{ type: 'letterPlaced', letter, position }]
    if (this.isSpelled()) {
      this.wordsSpelled += 1
      events.push({ type: 'wordSpelled', word: this.word.spelling, emoji: this.word.emoji, sound: this.word.sound })
    }
    return events
  }

  nextWord() {
    if (!this.isSpelled()) return
    this.word = this.takeWord()
    this.blanks = this.emptyBlanks()
  }

  snapshot(): SpellingSnapshot {
    return {
      phase: this.isSpelled() ? 'spelled' : 'spelling',
      emoji: this.word.emoji,
      blanks: [...this.blanks],
      wordsSpelled: this.wordsSpelled,
    }
  }

  private isSpelled(): boolean {
    return this.blanks.every((blank) => blank !== null)
  }

  private emptyBlanks(): (string | null)[] {
    return Array.from(this.word.spelling, () => null)
  }

  private takeWord(): Word {
    if (this.deck.length === 0) this.deck = this.freshDeck()
    return this.deck.shift()!
  }

  /** Short words first, each length shuffled among itself, so a round gets harder as it goes. */
  private freshDeck(): Word[] {
    const lengths = [...new Set(this.words.map((word) => word.spelling.length))].sort((a, b) => a - b)
    return lengths.flatMap((length) => this.shuffled(this.words.filter((word) => word.spelling.length === length)))
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
