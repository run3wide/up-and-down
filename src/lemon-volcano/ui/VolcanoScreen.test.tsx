import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import { LEMONS_PER_ROUND } from '../domain/volcanoGame'
import { VolcanoScreen } from './VolcanoScreen'

/** 0.5 puts every crater straight ahead, so tossing without aiming always scores. */
const straightAhead = () => 0.5

function renderGame(bestScore = 0) {
  const bestScores = new InMemoryBestScoreStore(bestScore)
  const onExit = vi.fn()
  render(<VolcanoScreen random={straightAhead} bestScores={bestScores} onExit={onExit} />)
  return { bestScores, onExit }
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
})
