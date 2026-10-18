import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import { SHOTS_PER_ROUND } from '../domain/hoopsGame'
import { HoopsScreen } from './HoopsScreen'

/** 0.5 puts every hoop straight ahead, so shooting without aiming always scores. */
const straightAhead = () => 0.5

function renderGame(bestScore = 0) {
  const bestScores = new InMemoryBestScoreStore(bestScore)
  const onExit = vi.fn()
  render(<HoopsScreen random={straightAhead} bestScores={bestScores} onExit={onExit} />)
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

function shootAndWatch() {
  press(' ')
  playFor(3)
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('HoopsScreen', () => {
  it('starts with no score and every shot left', () => {
    renderGame()

    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
    expect(screen.getByLabelText(`${SHOTS_PER_ROUND} shots left`)).toBeInTheDocument()
  })

  it('shoots with the space bar and scores when the ball drops through the hoop', () => {
    renderGame()

    shootAndWatch()

    expect(screen.getByRole('status')).toHaveTextContent('Score: 1')
    expect(screen.getByLabelText(`${SHOTS_PER_ROUND - 1} shots left`)).toBeInTheDocument()
  })

  it('misses when the arm has been aimed away from the hoop', () => {
    renderGame()
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    })
    playFor(2)
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' }))
    })

    shootAndWatch()

    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
  })

  it('pauses with Escape and resumes with the Resume button', () => {
    renderGame()

    press('Escape')
    const pause = screen.getByRole('dialog', { name: 'Paused' })
    fireEvent.click(within(pause).getByRole('button', { name: 'Resume' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not shoot while paused', () => {
    renderGame()
    press('Escape')

    press(' ')

    expect(screen.getByLabelText(`${SHOTS_PER_ROUND} shots left`)).toBeInTheDocument()
  })

  it('has on-screen controls for touch players', () => {
    renderGame()

    for (const name of ['Aim left', 'Aim right', 'Shoot']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
  })

  it('shows the final score and best score after the last shot, and saves a new best', () => {
    const { bestScores } = renderGame(3)

    for (let i = 0; i < SHOTS_PER_ROUND; i++) shootAndWatch()

    const gameOver = screen.getByRole('dialog', { name: 'Game over' })
    expect(within(gameOver).getByText(`Score: ${SHOTS_PER_ROUND}`)).toBeInTheDocument()
    expect(within(gameOver).getByText(`Best: ${SHOTS_PER_ROUND}`)).toBeInTheDocument()
    expect(bestScores.load()).toBe(SHOTS_PER_ROUND)
  })

  it('goes back to the games menu from the end of the round', () => {
    const { onExit } = renderGame()
    for (let i = 0; i < SHOTS_PER_ROUND; i++) shootAndWatch()

    fireEvent.click(screen.getByRole('button', { name: 'Back to games' }))

    expect(onExit).toHaveBeenCalledOnce()
  })
})
