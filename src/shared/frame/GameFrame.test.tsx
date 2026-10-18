import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GameFrame } from './GameFrame'
import { FrameControls } from './FrameControls'

const home = () => screen.getByRole('button', { name: 'Home' })

describe('GameFrame', () => {
  it('shows the game name and the game inside', () => {
    render(
      <GameFrame title="Dino Dig" onHome={() => {}}>
        <main>the game</main>
      </GameFrame>,
    )

    expect(screen.getByText('Dino Dig')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveTextContent('the game')
  })

  it('asks before leaving, and stays put on "Keep playing"', () => {
    const onHome = vi.fn()
    render(<GameFrame title="Dino Dig" onHome={onHome}>{null}</GameFrame>)

    fireEvent.click(home())
    expect(screen.getByRole('dialog', { name: 'Leave game?' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Keep playing' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onHome).not.toHaveBeenCalled()
  })

  it('goes home once the child says yes', () => {
    const onHome = vi.fn()
    render(<GameFrame title="Dino Dig" onHome={onHome}>{null}</GameFrame>)

    fireEvent.click(home())
    fireEvent.click(screen.getByRole('button', { name: 'Yes, go home' }))

    expect(onHome).toHaveBeenCalledOnce()
  })

  it('has no pause or mute buttons until the game asks for them', () => {
    render(<GameFrame title="Dino Dig" onHome={() => {}}>{null}</GameFrame>)

    expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /mute/i })).not.toBeInTheDocument()
  })

  it('puts the game’s mute and pause buttons in the bar', () => {
    const onToggleSound = vi.fn()
    const onPause = vi.fn()
    render(
      <GameFrame title="Dino Dig" onHome={() => {}}>
        <FrameControls sound={{ muted: false, onToggle: onToggleSound }} pause={{ paused: false, onPause }} />
      </GameFrame>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Mute sound' }))
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))

    expect(onToggleSound).toHaveBeenCalledOnce()
    expect(onPause).toHaveBeenCalledOnce()
  })

  it('shows the unmute label while muted, and cannot pause what is already paused', () => {
    render(
      <GameFrame title="Dino Dig" onHome={() => {}}>
        <FrameControls sound={{ muted: true, onToggle: () => {} }} pause={{ paused: true, onPause: () => {} }} />
      </GameFrame>,
    )

    expect(screen.getByRole('button', { name: 'Unmute sound' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pause' })).toBeDisabled()
  })

  it('pauses the game while the "Leave game?" card is up, so the clock does not run', () => {
    const onPause = vi.fn()
    render(
      <GameFrame title="Dino Dig" onHome={() => {}}>
        <FrameControls pause={{ paused: false, onPause }} />
      </GameFrame>,
    )

    fireEvent.click(home())

    expect(onPause).toHaveBeenCalledOnce()
  })

  it('does not pause again when the game is already paused', () => {
    const onPause = vi.fn()
    render(
      <GameFrame title="Dino Dig" onHome={() => {}}>
        <FrameControls pause={{ paused: true, onPause }} />
      </GameFrame>,
    )

    fireEvent.click(home())

    expect(onPause).not.toHaveBeenCalled()
  })
})
