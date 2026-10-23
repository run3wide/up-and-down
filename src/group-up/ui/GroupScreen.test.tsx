import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import { inFrame } from '../../test-support/inFrame'
import type { GroupQuiz } from '../domain/groupGame'
import { GroupScreen } from './GroupScreen'

/** 3x + 2y + 2x. */
const quiz: GroupQuiz = { ask: () => [{ count: 3, symbol: 'x' }, { count: 2, symbol: 'y' }, { count: 2, symbol: 'x' }] }

function renderGroup(bestScore = 0) {
  const bestScores = new InMemoryBestScoreStore(bestScore)
  const onExit = vi.fn()
  render(inFrame(<GroupScreen createQuiz={() => quiz} bestScores={bestScores} onExit={onExit} />))
  return { bestScores, onExit }
}

const pile = () => within(screen.getByRole('group', { name: 'Pile' }))
const chip = (name: string) => pile().getAllByRole('button', { name })[0]
const bin = (symbol: string) => screen.getByRole('button', { name: new RegExp(`^Box for ${symbol}`) })

/** Tap a chip, then tap the box. */
function tapInto(chipName: string, symbol: string) {
  fireEvent.click(chip(chipName))
  fireEvent.click(bin(symbol))
}

const groupEverything = () => {
  tapInto('3x', 'x')
  tapInto('2y', 'y')
  tapInto('2x', 'x')
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('GroupScreen', () => {
  it('shows the sum as chips in a pile, with a box for each kind of thing', () => {
    renderGroup()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Group the same things')
    expect(pile().getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual(['3x', '2y', '2x'])
    expect(bin('x')).toBeInTheDocument()
    expect(bin('y')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Sums: 0')
  })

  it('moves a tapped chip into the box for its own kind', () => {
    renderGroup()

    tapInto('3x', 'x')

    expect(pile().queryByRole('button', { name: '3x' })).not.toBeInTheDocument()
    expect(within(bin('x')).getByText('3x')).toBeInTheDocument()
  })

  it('moves a dragged chip into the box it is dropped on', () => {
    renderGroup()
    const target = bin('y')
    document.elementFromPoint = () => target

    fireEvent.pointerDown(chip('2y'), { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 80, clientY: 90, pointerId: 1 })
    fireEvent.pointerUp(window, { clientX: 80, clientY: 90, pointerId: 1 })

    expect(within(bin('y')).getByText('2y')).toBeInTheDocument()
  })

  it('gently says no to the wrong box, and the chip stays in the pile', () => {
    renderGroup()

    tapInto('3x', 'y')

    expect(screen.getByRole('alert')).toHaveTextContent('not the same')
    expect(bin('y')).toHaveClass('group-up__box--nuh-uh')
    expect(chip('3x')).toBeInTheDocument()
    act(() => void vi.advanceTimersByTime(700))
    expect(bin('y')).not.toHaveClass('group-up__box--nuh-uh')
  })

  it('shows the adding in a box once all its chips are in', () => {
    renderGroup()

    tapInto('3x', 'x')
    expect(within(bin('x')).queryByText('3x + 2x = 5x')).not.toBeInTheDocument()
    tapInto('2x', 'x')

    expect(within(bin('x')).getByText('3x + 2x = 5x')).toBeInTheDocument()
  })

  it('shows the answer when everything is grouped, and counts it', () => {
    const { bestScores } = renderGroup()

    groupEverything()

    expect(screen.getByRole('region', { name: 'Answer' })).toHaveTextContent('3x + 2y + 2x = 5x + 2y')
    expect(screen.getByRole('status')).toHaveTextContent('Sums: 1')
    expect(bestScores.load()).toBe(1)
  })

  it('starts a fresh sum after "Next sum"', () => {
    renderGroup()
    groupEverything()

    fireEvent.click(screen.getByRole('button', { name: 'Next sum' }))

    expect(pile().getAllByRole('button')).toHaveLength(3)
    expect(screen.queryByRole('region', { name: 'Answer' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Sums: 1')
  })

  it('pauses, with a way back to the main menu', () => {
    const { onExit } = renderGroup()

    fireEvent.click(screen.getByRole('button', { name: /pause/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Main menu' }))

    expect(onExit).toHaveBeenCalled()
  })
})
