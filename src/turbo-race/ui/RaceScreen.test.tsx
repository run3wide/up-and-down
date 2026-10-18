import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import { RaceScreen } from './RaceScreen'

/**
 * With every random value at 0.5 the course is nothing but cookies down the middle of the road,
 * so driving straight collects them all and finishes. With 0.1 every obstacle sits in the left lane,
 * so hugging the left edge crashes into all of them.
 */
const cookiesDownTheMiddle = () => 0.5
const hazardsInTheLeftLane = () => 0.1

function renderRace(random = cookiesDownTheMiddle, bestScore = 0) {
  const bestScores = new InMemoryBestScoreStore(bestScore)
  const onExit = vi.fn()
  const { container } = render(<RaceScreen random={random} bestScores={bestScores} onExit={onExit} />)
  const carLeft = () => Number.parseFloat((container.querySelector('.race-car') as HTMLElement).style.left)
  return { bestScores, onExit, carLeft }
}

function driveFor(seconds: number) {
  act(() => {
    vi.advanceTimersByTime(seconds * 1000)
  })
}

function keyDown(key: string) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }))
  })
}

function keyUp(key: string) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keyup', { key }))
  })
}

function press(key: string) {
  keyDown(key)
  keyUp(key)
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('RaceScreen', () => {
  it('starts with a countdown, no score and three lives', () => {
    renderRace()

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
    expect(screen.getByLabelText('3 lives left')).toBeInTheDocument()
  })

  it('counts down, shows Go! and then gets out of the way', () => {
    renderRace()

    driveFor(3.3)
    expect(screen.getByText('Go!')).toBeInTheDocument()

    driveFor(3)
    expect(screen.queryByText('Go!')).not.toBeInTheDocument()
  })

  it('steers right while the right arrow is held, and stays put once released', () => {
    const { carLeft } = renderRace()
    driveFor(3.3)
    const start = carLeft()

    keyDown('ArrowRight')
    driveFor(0.3)
    keyUp('ArrowRight')
    const steered = carLeft()
    driveFor(0.3)

    expect(steered).toBeGreaterThan(start)
    expect(carLeft()).toBe(steered)
  })

  it('steers with A and D as well', () => {
    const { carLeft } = renderRace()
    driveFor(3.3)

    keyDown('a')
    driveFor(0.3)

    expect(carLeft()).toBeLessThan(50)
  })

  it('collects cookies by driving through them', () => {
    renderRace()

    driveFor(8)

    expect(Number(screen.getByRole('status').textContent?.replace('Score: ', ''))).toBeGreaterThan(0)
  })

  it('shows progress along the road', () => {
    renderRace()
    driveFor(3.3)
    const before = Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'))

    driveFor(5)

    expect(Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeGreaterThan(before)
  })

  it('finishes the race at the line, records the best score and goes back to the menu', () => {
    const { bestScores, onExit } = renderRace()

    driveFor(90)

    const dialog = screen.getByRole('dialog', { name: 'Race finished!' })
    expect(within(dialog).getByText(/Score: \d+/)).toBeInTheDocument()
    expect(bestScores.load()).toBeGreaterThan(0)
    fireEvent.click(within(dialog).getByRole('button', { name: 'Back to games' }))
    expect(onExit).toHaveBeenCalledOnce()
  })

  it('is game over after three crashes', () => {
    renderRace(hazardsInTheLeftLane)
    keyDown('ArrowLeft')

    driveFor(90)

    expect(screen.getByRole('dialog', { name: 'Game over' })).toBeInTheDocument()
    expect(screen.getByLabelText('0 lives left')).toBeInTheDocument()
  })

  it('pauses with Escape, freezing the race, and resumes with the Resume button', () => {
    const { carLeft } = renderRace()
    driveFor(3.3)

    press('Escape')
    const pause = screen.getByRole('dialog', { name: 'Paused' })
    keyDown('ArrowRight')
    driveFor(1)
    expect(carLeft()).toBe(50)
    keyUp('ArrowRight')
    fireEvent.click(within(pause).getByRole('button', { name: 'Resume' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('can go back to the games menu from the pause dialog', () => {
    const { onExit } = renderRace()

    press('Escape')
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Paused' })).getByRole('button', { name: 'Main menu' }))

    expect(onExit).toHaveBeenCalledOnce()
  })

  it('has on-screen steering buttons for touch players', () => {
    renderRace()

    expect(screen.getByRole('button', { name: 'Steer left' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Steer right' })).toBeInTheDocument()
  })
})
