import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import { TicTacToeScreen } from './TicTacToeScreen'

const firstEmptySquare = () => 0

function renderBoard(sound = { unlock: vi.fn(), play: vi.fn() }, onExit = vi.fn()) {
  render(<TicTacToeScreen random={firstEmptySquare} bestScores={new InMemoryBestScoreStore()} sound={sound} onExit={onExit} />)
  return { sound, onExit }
}

const square = (number: number) => screen.getAllByRole('button', { name: new RegExp(`^Square ${number},`) })[0]
const tap = (...numbers: number[]) => numbers.forEach((number) => fireEvent.click(square(number)))
/** The computer takes the first empty square, so X wins down the middle column. */
const winTheRound = () => tap(5, 2, 8)

describe('TicTacToeScreen', () => {
  it('shows an empty board and whose turn it is', () => {
    renderBoard()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tic Tac Toe')
    expect(screen.getAllByRole('button', { name: /^Square \d, empty$/ })).toHaveLength(9)
    expect(screen.getByRole('alert')).toHaveTextContent(/your turn/i)
  })

  it('puts an X where the player taps and an O answers', () => {
    renderBoard()

    tap(5)

    expect(square(5)).toHaveAccessibleName('Square 5, X')
    expect(square(1)).toHaveAccessibleName('Square 1, O')
  })

  it('brings out a dinosaur that says winner when the player wins, once', () => {
    const { sound } = renderBoard()

    winTheRound()

    expect(screen.getByRole('img', { name: 'T-Rex' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Winner!')
    expect(screen.getByRole('status')).toHaveTextContent('Wins: 1')
    expect(sound.play).toHaveBeenCalledTimes(1)
    expect(sound.play).toHaveBeenCalledWith('winner')
  })

  it('stays quiet when the sound is muted', () => {
    const { sound } = renderBoard()

    fireEvent.click(screen.getByRole('button', { name: 'Mute sound' }))
    winTheRound()

    expect(sound.play).not.toHaveBeenCalled()
  })

  it('is kind about losing and offers another go with no dinosaur', () => {
    renderBoard()

    tap(9, 8, 6)

    expect(screen.getByRole('alert')).toHaveTextContent(/try again/i)
    expect(screen.queryByRole('img', { name: 'T-Rex' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Play again' })).toBeInTheDocument()
  })

  it('clears the board for another round and keeps the wins', () => {
    renderBoard()
    winTheRound()

    fireEvent.click(screen.getByRole('button', { name: 'Play again' }))

    expect(screen.getAllByRole('button', { name: /^Square \d, empty$/ })).toHaveLength(9)
    expect(screen.queryByRole('img', { name: 'T-Rex' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Wins: 1')
  })

  it('goes back to the games', () => {
    const { onExit } = renderBoard()

    fireEvent.click(screen.getByRole('button', { name: 'Back to games' }))

    expect(onExit).toHaveBeenCalled()
  })
})
