import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import type { SoundPlayer } from '../../shared/sound/SoundPlayer'
import type { MathQuestion, Quiz } from '../domain/quiz'
import { BRAIN_BREAK_QUESTIONS, QUIZ_BONUS_COOKIES } from '../domain/raceGame'
import { RaceScreen } from './RaceScreen'

/**
 * With every random value at 0.5 the course is nothing but cookies down the middle of the road,
 * so driving straight collects them all and finishes. With 0.1 every obstacle sits in the left lane,
 * so hugging the left edge crashes into all of them.
 */
const cookiesDownTheMiddle = () => 0.5
const hazardsInTheLeftLane = () => 0.1

const question: MathQuestion = {
  prompt: '2x + 6x =',
  options: ['8x', '8', '8y'],
  correctIndex: 0,
  explanation: 'Same things go together: 2x + 6x = 8x',
}
const brainBreak = (): Quiz => ({ ask: () => question })

function renderRace(random = cookiesDownTheMiddle, bestScore = 0, createQuiz?: () => Quiz) {
  const bestScores = new InMemoryBestScoreStore(bestScore)
  const onExit = vi.fn()
  const sound = { unlock: vi.fn(), play: vi.fn() } satisfies SoundPlayer
  const { container } = render(<RaceScreen random={random} bestScores={bestScores} sound={sound} createQuiz={createQuiz} onExit={onExit} />)
  const carLeft = () => Number.parseFloat((container.querySelector('.race-car') as HTMLElement).style.left)
  return { bestScores, onExit, sound, carLeft }
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

  it('roars as the race starts and does the victory roar at the finish line', () => {
    const { sound } = renderRace()

    driveFor(2.5)
    expect(sound.play).not.toHaveBeenCalled()
    driveFor(1)
    expect(sound.play).toHaveBeenCalledExactlyOnceWith('roar')

    driveFor(90)
    expect(sound.play).toHaveBeenLastCalledWith('victoryRoar')
    expect(sound.play).toHaveBeenCalledTimes(2)
  })

  it('is silent while sound is muted', () => {
    const { sound } = renderRace()

    fireEvent.click(screen.getByRole('button', { name: 'Mute sound' }))
    driveFor(90)

    expect(sound.play).not.toHaveBeenCalled()
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

describe('brain breaks', () => {
  const score = () => Number(screen.getByRole('status').textContent?.replace('Score: ', ''))
  const questionDialog = () => screen.getByRole('dialog', { name: 'Maths question' })

  function askedQuestion() {
    const race = renderRace(cookiesDownTheMiddle, 0, brainBreak)
    driveFor(3.3)
    return race
  }

  it('does not ask anything in a race without a quiz', () => {
    renderRace()

    driveFor(20)

    expect(screen.queryByRole('dialog', { name: 'Maths question' })).not.toBeInTheDocument()
  })

  it('pops up a question with the sum and three answers to pick from', () => {
    askedQuestion()

    const dialog = questionDialog()
    expect(within(dialog).getByText('2x + 6x =')).toBeInTheDocument()
    expect(within(dialog).getAllByRole('button').map((button) => button.textContent)).toEqual(['8x', '8', '8y'])
  })

  it('stops the race while the question is showing', () => {
    askedQuestion()
    const before = screen.getByRole('progressbar').getAttribute('aria-valuenow')

    driveFor(5)

    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(before)
    expect(questionDialog()).toBeInTheDocument()
  })

  it('does not open the pause menu on top of a question', () => {
    askedQuestion()

    press('Escape')

    expect(screen.queryByRole('dialog', { name: 'Paused' })).not.toBeInTheDocument()
  })

  it('rewards the right answer first time with bonus cookies and explains why', () => {
    askedQuestion()
    const before = score()

    fireEvent.click(within(questionDialog()).getByRole('button', { name: '8x' }))

    expect(score()).toBe(before + QUIZ_BONUS_COOKIES)
    expect(screen.getByText(/Same things go together: 2x \+ 6x = 8x/)).toBeInTheDocument()
  })

  it('is kind about a wrong answer: it greys out, a hint appears, and the question stays', () => {
    askedQuestion()
    const before = score()

    fireEvent.click(within(questionDialog()).getByRole('button', { name: '8' }))

    expect(within(questionDialog()).getByRole('button', { name: '8' })).toBeDisabled()
    expect(within(questionDialog()).getByText(/only the same things go together/i)).toBeInTheDocument()
    expect(score()).toBe(before)
  })

  it('moves on after the right answer even following a slip, but gives no bonus', () => {
    askedQuestion()
    const before = score()
    fireEvent.click(within(questionDialog()).getByRole('button', { name: '8y' }))

    fireEvent.click(within(questionDialog()).getByRole('button', { name: '8x' }))

    expect(within(questionDialog()).getByRole('button', { name: '8y' })).toBeEnabled()
    expect(score()).toBe(before)
  })

  it('lets a keyboard player pick with 1, 2 and 3', () => {
    askedQuestion()
    const before = score()

    press('1')

    expect(score()).toBe(before + QUIZ_BONUS_COOKIES)
  })

  it('asks a few questions up front, then races on without stopping again', () => {
    askedQuestion()
    for (let i = 0; i < BRAIN_BREAK_QUESTIONS; i++) press('1')
    expect(screen.queryByRole('dialog', { name: 'Maths question' })).not.toBeInTheDocument()
    const before = screen.getByRole('progressbar').getAttribute('aria-valuenow')

    driveFor(1)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).not.toBe(before)
    driveFor(10)

    expect(screen.queryByRole('dialog', { name: 'Maths question' })).not.toBeInTheDocument()
  })
})
