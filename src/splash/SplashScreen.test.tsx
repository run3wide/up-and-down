import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SplashScreen } from './SplashScreen'
import { loadStyles } from '../test-support/loadStyles'

const upAndDown = { name: 'Play Up and Down, by Daniel' }
const lemonVolcano = { name: 'Play Lemon Volcano, by Moses' }
const dinoRace = { name: 'Play Dino Race, by Daniel' }
const littleChef = { name: 'Play Little Chef, by Vanessa' }
const matchUp = { name: 'Play Match Up, by Daniel' }
const cookieMaze = { name: 'Play Cookie Maze, by Daniel' }
const ticTacToe = { name: 'Play Tic Tac Toe, by Daniel' }
const spellingBee = { name: 'Play Spelling Bee, by Daniel' }
const dinoDig = { name: 'Play Dino Dig, by Moses' }

describe('SplashScreen', () => {
  it('offers every game with their authors', () => {
    render(<SplashScreen onPick={() => {}} />)

    expect(screen.getByRole('heading', { name: 'Pick a game' })).toBeInTheDocument()
    expect(screen.getByRole('button', upAndDown)).toHaveTextContent('Daniel')
    expect(screen.getByRole('button', lemonVolcano)).toHaveTextContent('Moses')
    expect(screen.getByRole('button', dinoRace)).toHaveTextContent('Daniel')
    expect(screen.getByRole('button', littleChef)).toHaveTextContent('Vanessa')
    expect(screen.getByRole('button', matchUp)).toHaveTextContent('Daniel')
    expect(screen.getByRole('button', cookieMaze)).toHaveTextContent('Daniel')
    expect(screen.getByRole('button', ticTacToe)).toHaveTextContent('Daniel')
    expect(screen.getByRole('button', spellingBee)).toHaveTextContent('Daniel')
    expect(screen.getByRole('button', dinoDig)).toHaveTextContent('Moses')
  })

  it('focuses the first game so keyboard players can begin straight away', () => {
    render(<SplashScreen onPick={() => {}} />)

    expect(screen.getByRole('button', upAndDown)).toHaveFocus()
  })

  it.each([
    ['Up and Down', upAndDown, 'up-and-down'],
    ['Lemon Volcano', lemonVolcano, 'lemon-volcano'],
    ['Dino Race', dinoRace, 'dino-race'],
    ['Little Chef', littleChef, 'little-chef'],
    ['Match Up', matchUp, 'match-up'],
    ['Cookie Maze', cookieMaze, 'cookie-maze'],
    ['Tic Tac Toe', ticTacToe, 'tic-tac-toe'],
    ['Spelling Bee', spellingBee, 'spelling-bee'],
    ['Dino Dig', dinoDig, 'dino-dig'],
  ])('starts %s when its card is chosen', async (_title, button, gameId) => {
    const onPick = vi.fn()
    render(<SplashScreen onPick={onPick} />)

    await userEvent.click(screen.getByRole('button', button))

    expect(onPick).toHaveBeenCalledExactlyOnceWith(gameId)
  })

  // jsdom has no layout, so it cannot tell us the cards overflow; it can tell us whether overflow would be reachable.
  describe('on a screen too small for every card', () => {
    function renderStyled() {
      const removeStyles = loadStyles('index.css', 'splash/splash.css')
      render(<SplashScreen onPick={() => {}} />)
      return removeStyles
    }

    it('can be scrolled to reach the last game, because the page itself does not scroll', () => {
      const removeStyles = renderStyled()

      expect(getComputedStyle(document.body).overflow).toBe('hidden')
      expect(getComputedStyle(screen.getByRole('main')).overflowY).toBe('auto')

      removeStyles()
    })

    it('does not clip the top of the content when it is taller than the screen', () => {
      const removeStyles = renderStyled()

      expect(getComputedStyle(screen.getByRole('main')).alignItems).toBe('start')

      removeStyles()
    })
  })
})
