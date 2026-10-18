import { describe, expect, it } from 'vitest'
import { TicTacToeGame } from './ticTacToeGame'

const firstEmptySquare = () => 0

/** A game whose computer plays O on exactly the squares given, in order. */
function gameWhereComputerPlays(...squares: number[]) {
  const remaining = [...squares]
  const game: TicTacToeGame = new TicTacToeGame(() => {
    const empty = game.snapshot().squares.flatMap((mark, square) => (mark === null ? [square] : []))
    return (empty.indexOf(remaining.shift()!) + 0.5) / empty.length
  })
  return game
}

describe('TicTacToeGame', () => {
  it('starts with an empty board and no wins', () => {
    const { squares, phase, wins, winningLine } = new TicTacToeGame(firstEmptySquare).snapshot()

    expect(squares).toEqual(Array(9).fill(null))
    expect(phase).toBe('playing')
    expect(wins).toBe(0)
    expect(winningLine).toBeNull()
  })

  it('puts the player’s X down and answers with an O', () => {
    const game = new TicTacToeGame(firstEmptySquare)

    game.play(4)

    expect(game.snapshot().squares).toEqual(['O', null, null, null, 'X', null, null, null, null])
  })

  it('lets the computer choose among the empty squares only', () => {
    const game = gameWhereComputerPlays(8)

    game.play(0)

    expect(game.snapshot().squares[8]).toBe('O')
  })

  it('ignores a square that is already taken', () => {
    const game = new TicTacToeGame(firstEmptySquare)
    game.play(4)

    const events = game.play(4)

    expect(events).toEqual([])
    expect(game.snapshot().squares.filter((mark) => mark === 'X')).toHaveLength(1)
  })

  it('is won by three Xs in a row, and the winning line is remembered', () => {
    const game = gameWhereComputerPlays(0, 2)
    game.play(4)
    game.play(1)

    const events = game.play(7)

    const { phase, wins, winningLine } = game.snapshot()
    expect(events).toEqual([{ type: 'gameWon' }])
    expect(phase).toBe('won')
    expect(wins).toBe(1)
    expect(winningLine).toEqual([1, 4, 7])
  })

  it('does not let the computer answer once the player has won', () => {
    const game = gameWhereComputerPlays(0, 2)
    game.play(4)
    game.play(1)
    game.play(7)

    expect(game.snapshot().squares.filter((mark) => mark === 'O')).toHaveLength(2)
  })

  it('is lost when the computer gets three Os in a row, which is not a win', () => {
    const game = gameWhereComputerPlays(0, 1, 2)
    game.play(8)
    game.play(7)

    const events = game.play(5)

    expect(events).toEqual([{ type: 'gameLost' }])
    expect(game.snapshot().phase).toBe('lost')
    expect(game.snapshot().wins).toBe(0)
    expect(game.snapshot().winningLine).toEqual([0, 1, 2])
  })

  it('is a draw when the board fills up with no line', () => {
    const game = gameWhereComputerPlays(1, 4, 5, 6)
    for (const square of [0, 2, 3, 7]) game.play(square)

    const events = game.play(8)

    expect(events).toEqual([{ type: 'gameDrawn' }])
    expect(game.snapshot().phase).toBe('drawn')
    expect(game.snapshot().winningLine).toBeNull()
  })

  it('takes no more moves once the round is over', () => {
    const game = gameWhereComputerPlays(0, 2)
    game.play(4)
    game.play(1)
    game.play(7)

    expect(game.play(3)).toEqual([])
    expect(game.snapshot().squares[3]).toBeNull()
  })

  it('clears the board for another round but keeps the wins', () => {
    const game = gameWhereComputerPlays(0, 2)
    game.play(4)
    game.play(1)
    game.play(7)

    game.playAgain()

    const { squares, phase, wins, winningLine } = game.snapshot()
    expect(squares).toEqual(Array(9).fill(null))
    expect(phase).toBe('playing')
    expect(wins).toBe(1)
    expect(winningLine).toBeNull()
  })
})
