import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import type { SoundPlayer } from '../application/SoundPlayer'
import { LEMONS_PER_ROUND } from '../domain/volcanoGame'
import { VolcanoScreen } from './VolcanoScreen'

/** 0.5 puts every crater straight ahead, so tossing without aiming always scores. */
const straightAhead = () => 0.5

function renderGame(bestScore = 0) {
  const bestScores = new InMemoryBestScoreStore(bestScore)
  const onExit = vi.fn()
  const sound = { unlock: vi.fn(), play: vi.fn() } satisfies SoundPlayer
  const { container } = render(<VolcanoScreen random={straightAhead} bestScores={bestScores} sound={sound} onExit={onExit} />)
  const lavaSplats = () => container.querySelectorAll('.lava-splat')
  const lavaFlows = () => container.querySelectorAll('.lava-flow')
  return { bestScores, onExit, sound, lavaSplats, lavaFlows }
}

function playFor(seconds: number) {
  act(() => {
    vi.advanceTimersByTime(seconds * 1000)
  })
}

function press(key: string) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }))
    window.dispatchEvent(new KeyboardEvent('keyup', { key }))
  })
}

function tossAndWatch() {
  press(' ')
  playFor(3)
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('VolcanoScreen', () => {
  it('starts with no score and every lemon left', () => {
    renderGame()

    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
    expect(screen.getByLabelText(`${LEMONS_PER_ROUND} lemons left`)).toBeInTheDocument()
  })

  it('tosss with the space bar and scores when the lemon drops through the crater', () => {
    renderGame()

    tossAndWatch()

    expect(screen.getByRole('status')).toHaveTextContent('Score: 1')
    expect(screen.getByLabelText(`${LEMONS_PER_ROUND - 1} lemons left`)).toBeInTheDocument()
  })

  it('misses when the arm has been aimed away from the crater', () => {
    renderGame()
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    })
    playFor(2)
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
    })

    tossAndWatch()

    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
  })

  it('pauses with Escape and resumes with the Resume button', () => {
    renderGame()

    press('Escape')
    const pause = screen.getByRole('dialog', { name: 'Paused' })
    fireEvent.click(within(pause).getByRole('button', { name: 'Resume' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('can go back to the games menu from the pause dialog', () => {
    const { onExit } = renderGame()

    press('Escape')
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Paused' })).getByRole('button', { name: 'Main menu' }))

    expect(onExit).toHaveBeenCalledOnce()
  })

  it('does not toss while paused', () => {
    renderGame()
    press('Escape')

    press(' ')

    expect(screen.getByLabelText(`${LEMONS_PER_ROUND} lemons left`)).toBeInTheDocument()
  })

  it('has on-screen controls for touch players', () => {
    renderGame()

    for (const name of ['Aim left', 'Aim right', 'Throw']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('shows the final score and best score after the last lemon, and saves a new best', () => {
    const { bestScores } = renderGame(3)

    for (let i = 0; i < LEMONS_PER_ROUND; i++) tossAndWatch()

    const gameOver = screen.getByRole('dialog', { name: 'Game over' })
    expect(within(gameOver).getByText(`Score: ${LEMONS_PER_ROUND}`)).toBeInTheDocument()
    expect(within(gameOver).getByText(`Best: ${LEMONS_PER_ROUND}`)).toBeInTheDocument()
    expect(bestScores.load()).toBe(LEMONS_PER_ROUND)
  })

  it('goes back to the games menu from the end of the round', () => {
    const { onExit } = renderGame()
    for (let i = 0; i < LEMONS_PER_ROUND; i++) tossAndWatch()

    fireEvent.click(screen.getByRole('button', { name: 'Back to games' }))

    expect(onExit).toHaveBeenCalledOnce()
  })

  describe('when a lemon drops into the volcano', () => {
    it('plays the eruption sound', () => {
      const { sound } = renderGame()

      tossAndWatch()

      expect(sound.play).toHaveBeenCalledExactlyOnceWith('eruption')
    })

    it('stays quiet for a lemon that misses', () => {
      const { sound } = renderGame()
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
      })
      playFor(2)
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
      })

      tossAndWatch()

      expect(sound.play).not.toHaveBeenCalled()
    })

    it('is silent while sound is muted, and loud again once unmuted', () => {
      const { sound } = renderGame()

      fireEvent.click(screen.getByRole('button', { name: 'Mute sound' }))
      tossAndWatch()
      expect(sound.play).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'Unmute sound' }))
      tossAndWatch()
      expect(sound.play).toHaveBeenCalledOnce()
    })

    it('splats lava on the screen that sticks for a while, then rolls off and is gone', () => {
      const { lavaSplats } = renderGame()
      expect(lavaSplats()).toHaveLength(0)

      tossAndWatch()
      expect(lavaSplats().length).toBeGreaterThan(0)

      playFor(7)
      expect(lavaSplats()).toHaveLength(0)
    })

    it('sends red lava flowing down the sides of the volcano, which cools off after a while', () => {
      const { lavaFlows } = renderGame()
      expect(lavaFlows()).toHaveLength(0)

      tossAndWatch()
      expect(lavaFlows().length).toBeGreaterThan(0)

      playFor(7)
      expect(lavaFlows()).toHaveLength(0)
    })

    it('splats no lava for a miss', () => {
      const { lavaSplats, lavaFlows } = renderGame()
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
      })
      playFor(2)
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
      })

      tossAndWatch()

      expect(lavaSplats()).toHaveLength(0)
      expect(lavaFlows()).toHaveLength(0)
    })
  })

  it('unlocks audio on the first throw, because browsers need a user gesture', () => {
    const { sound } = renderGame()
    expect(sound.unlock).not.toHaveBeenCalled()

    press(' ')

    expect(sound.unlock).toHaveBeenCalled()
  })
})
