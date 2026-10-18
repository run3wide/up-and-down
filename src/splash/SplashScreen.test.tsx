import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SplashScreen } from './SplashScreen'

describe('SplashScreen', () => {
  it('shows the title and the author', () => {
    render(<SplashScreen onStart={() => {}} />)

    expect(screen.getByRole('heading', { name: 'Up and Down' })).toBeInTheDocument()
    expect(screen.getByText('by Daniel Robson')).toBeInTheDocument()
  })

  it('focuses the Start button so keyboard players can begin straight away', () => {
    render(<SplashScreen onStart={() => {}} />)

    expect(screen.getByRole('button', { name: 'Start' })).toHaveFocus()
  })

  it('starts the game when Start is clicked', async () => {
    const onStart = vi.fn()
    render(<SplashScreen onStart={onStart} />)

    await userEvent.click(screen.getByRole('button', { name: 'Start' }))

    expect(onStart).toHaveBeenCalledOnce()
  })
})
