import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SplashScreen } from './SplashScreen'

const upAndDown = { name: 'Play Up and Down, by Daniel' }
const lemonVolcano = { name: 'Play Lemon Volcano, by Moses' }
const dinoRace = { name: 'Play Dino Race, by Daniel' }
const littleChef = { name: 'Play Little Chef, by Vanessa' }

describe('SplashScreen', () => {
  it('offers every game with their authors', () => {
    render(<SplashScreen onPick={() => {}} />)

    expect(screen.getByRole('heading', { name: 'Pick a game' })).toBeInTheDocument()
    expect(screen.getByRole('button', upAndDown)).toHaveTextContent('Daniel')
    expect(screen.getByRole('button', lemonVolcano)).toHaveTextContent('Moses')
    expect(screen.getByRole('button', dinoRace)).toHaveTextContent('Daniel')
    expect(screen.getByRole('button', littleChef)).toHaveTextContent('Vanessa')
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
  ])('starts %s when its card is chosen', async (_title, button, gameId) => {
    const onPick = vi.fn()
    render(<SplashScreen onPick={onPick} />)

    await userEvent.click(screen.getByRole('button', button))

    expect(onPick).toHaveBeenCalledExactlyOnceWith(gameId)
  })
})
