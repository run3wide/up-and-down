import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import { inFrame } from '../../test-support/inFrame'
import type { Sum, SumQuiz } from '../domain/sum'
import { BakeryScreen } from './BakeryScreen'

const sum: Sum = {
  prompt: '1x + 2y + 3x + 1y =',
  answer: [{ count: 4, symbol: 'x' }, { count: 3, symbol: 'y' }],
  counts: [3, 7, 4, 5],
  symbols: ['y', 'z', 'x'],
  explanation: 'Keep x with x and y with y',
}
const quiz: SumQuiz = { ask: () => sum }

function renderBakery(bestScore = 0) {
  const bestScores = new InMemoryBestScoreStore(bestScore)
  const onExit = vi.fn()
  render(inFrame(<BakeryScreen createQuiz={() => quiz} bestScores={bestScores} onExit={onExit} />))
  return { bestScores, onExit }
}

const tiles = () => within(screen.getByRole('group', { name: 'Tiles' }))
const tile = (name: string) => tiles().getByRole('button', { name })
const blanks = () => within(screen.getByRole('group', { name: 'Answer' })).getAllByRole('button')
const choice = (name: string) => fireEvent.click(within(screen.getByRole('group', { name: 'Choices' })).getByRole('button', { name }))
const heading = () => screen.getByRole('heading', { level: 1 })

/** Tap a tile, then tap the blank it belongs in. */
function tapInto(tileName: string, blank: number) {
  fireEvent.click(tile(tileName))
  fireEvent.click(blanks()[blank])
}

const solve = () => {
  tapInto('4', 0)
  tapInto('x', 1)
  tapInto('3', 2)
  tapInto('y', 3)
}

function addToCake(picks: string[]) {
  for (const pick of picks) {
    solve()
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
  it('starts by asking for a shape, with a sum, empty blanks and no multiple choice', () => {
    renderBakery()

    expect(heading()).toHaveTextContent('Pick a shape')
    expect(screen.getByText('1x + 2y + 3x + 1y =')).toBeInTheDocument()
    expect(blanks()).toHaveLength(4)
    expect(blanks().map((blank) => blank.getAttribute('aria-label'))).toEqual(['Number blank 1', 'Thing blank 1', 'Number blank 2', 'Thing blank 2'])
    expect(tiles().getAllByRole('button')).toHaveLength(7)
    expect(screen.queryByRole('group', { name: 'Choices' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Cakes: 0')
  })

  it('moves a tapped tile into a tapped blank', () => {
    renderBakery()

    tapInto('4', 0)

    expect(blanks()[0]).toHaveAccessibleName('Number 4')
    expect(tiles().queryByRole('button', { name: '4' })).not.toBeInTheDocument()
  })

  it('moves a dragged tile into the blank it is dropped on', () => {
    renderBakery()
    const target = blanks()[1]
    document.elementFromPoint = () => target

    fireEvent.pointerDown(tile('x'), { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 80, clientY: 90, pointerId: 1 })
    fireEvent.pointerUp(window, { clientX: 80, clientY: 90, pointerId: 1 })

    expect(blanks()[1]).toHaveAccessibleName('Thing x')
  })

  it('drops back into the tray when let go away from a blank', () => {
    renderBakery()
    document.elementFromPoint = () => document.body

    fireEvent.pointerDown(tile('x'), { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 80, clientY: 90, pointerId: 1 })
    fireEvent.pointerUp(window, { clientX: 80, clientY: 90, pointerId: 1 })

    expect(tile('x')).toBeInTheDocument()
    expect(blanks()[1]).toHaveAccessibleName('Thing blank 1')
  })

  it('says where a tile belongs when it is put in the wrong kind of blank', () => {
    renderBakery()

    tapInto('4', 1)

    expect(screen.getByRole('alert')).toHaveTextContent('Numbers go in the number blanks')
    expect(tile('4')).toBeInTheDocument()
  })

  it('takes a tile back out when its blank is tapped', () => {
    renderBakery()
    tapInto('4', 0)

    fireEvent.click(blanks()[0])

    expect(blanks()[0]).toHaveAccessibleName('Number blank 1')
    expect(tile('4')).toBeInTheDocument()
  })

  it('gently says no to a wrong answer, shakes, and puts every tile back', () => {
    renderBakery()

    tapInto('7', 0)
    tapInto('x', 1)
    tapInto('3', 2)
    tapInto('y', 3)

    expect(screen.getByRole('alert')).toHaveTextContent('Not quite')
    expect(screen.getByRole('group', { name: 'Answer' })).toHaveClass('bakery__answer--nuh-uh')
    expect(tiles().getAllByRole('button')).toHaveLength(7)
    expect(screen.queryByRole('group', { name: 'Choices' })).not.toBeInTheDocument()
    act(() => void vi.advanceTimersByTime(700))
    expect(screen.getByRole('group', { name: 'Answer' })).not.toHaveClass('bakery__answer--nuh-uh')
  })

  it('unlocks the shapes after a right answer, and says why it was right', () => {
    renderBakery()

    solve()

    expect(screen.getByRole('alert')).toHaveTextContent('Keep x with x and y with y')
    const shapes = within(screen.getByRole('group', { name: 'Choices' })).getAllByRole('button')
    expect(shapes.map((button) => button.getAttribute('aria-label'))).toEqual(['Dinosaur', 'Strawberry', 'Race car', 'Fish', 'Shark', 'Tiger'])
    expect(screen.queryByRole('group', { name: 'Tiles' })).not.toBeInTheDocument()
  })

  it('accepts 3y + 4x as well as 4x + 3y', () => {
    renderBakery()

    tapInto('3', 0)
    tapInto('y', 1)
    tapInto('4', 2)
    tapInto('x', 3)

    expect(screen.getByRole('group', { name: 'Choices' })).toBeInTheDocument()
  })

  it('puts the chosen shape on the cake and moves on to the flavour with a fresh sum', () => {
    renderBakery()

    addToCake(['Shark'])

    expect(heading()).toHaveTextContent('Pick a flavour')
    expect(screen.getByRole('img', { name: /Shark/ })).toBeInTheDocument()
    expect(blanks().every((blank) => /blank/.test(blank.getAttribute('aria-label') ?? ''))).toBe(true)
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
