export type Mark = 'X' | 'O'
export type Square = Mark | null
export type Phase = 'playing' | 'won' | 'lost' | 'drawn'
export type TicTacToeEvent = { type: 'gameWon' } | { type: 'gameLost' } | { type: 'gameDrawn' }

export interface TicTacToeSnapshot {
  readonly squares: readonly Square[]
  readonly phase: Phase
  /** The three squares that make the winning row, for whoever won. */
  readonly winningLine: readonly number[] | null
  /** Rounds the player has won since opening the game. */
  readonly wins: number
}

const LINES: readonly (readonly number[])[] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

/** The player is X and goes first; the computer is O and picks any empty square. */
export class TicTacToeGame {
  private squares: Square[] = emptyBoard()
  private phase: Phase = 'playing'
  private winningLine: readonly number[] | null = null
  private wins = 0

  private readonly random: () => number

  constructor(random: () => number) {
    this.random = random
  }

  snapshot(): TicTacToeSnapshot {
    return { squares: [...this.squares], phase: this.phase, winningLine: this.winningLine, wins: this.wins }
  }

  play(square: number): TicTacToeEvent[] {
    if (this.phase !== 'playing' || this.squares[square] !== null) return []
    this.squares[square] = 'X'
    return this.settle() ?? this.computerReplies()
  }

  playAgain(): void {
    this.squares = emptyBoard()
    this.phase = 'playing'
    this.winningLine = null
  }

  private computerReplies(): TicTacToeEvent[] {
    const empty = this.squares.flatMap((mark, square) => (mark === null ? [square] : []))
    this.squares[empty[Math.floor(this.random() * empty.length)]] = 'O'
    return this.settle() ?? []
  }

  /** Ends the round if the last move decided it. */
  private settle(): TicTacToeEvent[] | null {
    const line = LINES.find(([a, b, c]) => this.squares[a] !== null && this.squares[a] === this.squares[b] && this.squares[a] === this.squares[c])
    if (line) {
      this.winningLine = line
      const playerWon = this.squares[line[0]] === 'X'
      this.phase = playerWon ? 'won' : 'lost'
      if (playerWon) this.wins += 1
      return [{ type: playerWon ? 'gameWon' : 'gameLost' }]
    }
    if (this.squares.every((mark) => mark !== null)) {
      this.phase = 'drawn'
      return [{ type: 'gameDrawn' }]
    }
    return null
  }
}

function emptyBoard(): Square[] {
  return Array(9).fill(null)
}
