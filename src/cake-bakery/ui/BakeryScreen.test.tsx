import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Quiz } from '../../dino-race/domain/quiz'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import { inFrame } from '../../test-support/inFrame'
import { BakeryScreen } from './BakeryScreen'

const quiz: Quiz = {
  ask: () => ({ prompt: '1x + 2y + 3x + 1y =', options: ['4x + 3y', '7x', '3x + 4y'], correctIndex: 0, explanation: 'Keep x with x and y with y' }),
}

function renderBakery(bestScore = 0) {
  const bestScores = new InMemoryBestScoreStore(bestScore)
  const onExit = vi.fn()
  render(inFrame(<BakeryScreen createQuiz={() => quiz} bestScores={bestScores} onExit={onExit} />))
  return { bestScores, onExit }
}

const answer = (name: string) => fireEvent.click(within(screen.getByRole('group', { name: 'Answers' })).getByRole('button', { name }))
const choice = (name: string) => fireEvent.click(within(screen.getByRole('group', { name: 'Choices' })).getByRole('button', { name }))
const heading = () => screen.getByRole('heading', { level: 1 })

function addToCake(picks: string[]) {
  for (const pick of picks) {
    answer('4x + 3y')
    choice(pick)
  }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('BakeryScreen', () => {
  it('starts by asking for a shape, with a sum to solve first', () => {
    renderBakery()

    expect(heading()).toHaveTextContent('Pick a shape')
    expect(screen.getByText('1x + 2y + 3x + 1y =')).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: 'Answers' })).getAllByRole('button')).toHaveLength(3)
    expect(screen.queryByRole('group', { name: 'Choices' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Cakes: 0')
  })

  it('gently says try again to a wrong answer and keeps the sum', () => {
    renderBakery()

    answer('7x')

    expect(screen.getByRole('alert')).toHaveTextContent('Not quite')
    expect(within(screen.getByRole('group', { name: 'Answers' })).getByRole('button', { name: '7x' })).toBeDisabled()
    expect(screen.queryByRole('group', { name: 'Choices' })).not.toBeInTheDocument()
  })

  it('shakes the wrong answer, then settles', () => {
    renderBakery()

    answer('7x')
    const wrong = within(screen.getByRole('group', { name: 'Answers' })).getByRole('button', { name: '7x' })
    expect(wrong).toHaveClass('bakery__answer--nuh-uh')
    act(() => void vi.advanceTimersByTime(700))

    expect(wrong).not.toHaveClass('bakery__answer--nuh-uh')
  })

  it('unlocks the shapes after a right answer, and says why it was right', () => {
    renderBakery()

    answer('4x + 3y')

    expect(screen.getByRole('alert')).toHaveTextContent('Keep x with x and y with y')
    const shapes = within(screen.getByRole('group', { name: 'Choices' })).getAllByRole('button')
    expect(shapes.map((button) => button.getAttribute('aria-label'))).toEqual(['Dinosaur', 'Strawberry', 'Race car', 'Fish', 'Shark', 'Tiger'])
  })

  it('puts the chosen shape on the cake and moves on to the flavour', () => {
    renderBakery()

    addToCake(['Shark'])

    expect(heading()).toHaveTextContent('Pick a flavour')
    expect(screen.getByRole('img', { name: /Shark/ })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Choices' })).not.toBeInTheDocument()
  })

  it('bakes a finished cake, counts it and keeps the best', () => {
    const { bestScores } = renderBakery(0)

    addToCake(['Tiger', 'Pumpkin', 'Lemon', 'Sprinkles'])

    expect(screen.getByRole('heading', { name: 'Your cake is ready!' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'A Tiger cake: Pumpkin cake, Lemon frosting and Sprinkles on top' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Cakes: 1')
    expect(bestScores.load()).toBe(1)
  })

  it('starts a fresh cake after "Bake another cake"', () => {
    renderBakery()
    addToCake(['Tiger', 'Pumpkin', 'Lemon', 'Sprinkles'])

    fireEvent.click(screen.getByRole('button', { name: 'Bake another cake' }))

    expect(heading()).toHaveTextContent('Pick a shape')
    expect(screen.getByRole('status')).toHaveTextContent('Cakes: 1')
  })

  it('pauses, with a way back to the main menu', () => {
    const { onExit } = renderBakery()

    fireEvent.click(screen.getByRole('button', { name: /pause/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Main menu' }))

    expect(onExit).toHaveBeenCalled()
  })
})
