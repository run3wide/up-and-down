import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SplashScreen } from './SplashScreen'

const upAndDown = { name: 'Play Up and Down, by Daniel Robson' }
const lemonVolcano = { name: 'Play Lemon Volcano, by Moses Robson' }

describe('SplashScreen', () => {
  it('offers both games with their authors', () => {
    render(<SplashScreen onPick={() => {}} />)

    expect(screen.getByRole('heading', { name: 'Pick a game' })).toBeInTheDocument()
    expect(screen.getByRole('button', upAndDown)).toHaveTextContent('Daniel Robson')
    expect(screen.getByRole('button', lemonVolcano)).toHaveTextContent('Moses Robson')
  })

  it('focuses the first game so keyboard players can begin straight away', () => {
    render(<SplashScreen onPick={() => {}} />)

    expect(screen.getByRole('button', upAndDown)).toHaveFocus()
  })

  it.each([
    ['Up and Down', upAndDown, 'up-and-down'],
    ['Lemon Volcano', lemonVolcano, 'lemon-volcano'],
  ])('starts %s when its card is chosen', async (_title, button, gameId) => {
    const onPick = vi.fn()
    render(<SplashScreen onPick={onPick} />)

    await userEvent.click(screen.getByRole('button', button))

    expect(onPick).toHaveBeenCalledExactlyOnceWith(gameId)
  })
})
