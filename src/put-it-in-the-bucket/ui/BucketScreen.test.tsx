import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import { DIFFICULTIES, ITEMS, type Difficulty } from '../domain/items'
import { BucketScreen } from './BucketScreen'
import { inFrame } from '../../test-support/inFrame'

/** With every random value at 0 the first item is the first of the list: a cow. */
const alwaysFirstItem = () => 0

function renderBuckets(bestScore = 0, level: Difficulty = 'easy') {
  const bestScores = Object.fromEntries(DIFFICULTIES.map((difficulty) => [difficulty, new InMemoryBestScoreStore(difficulty === level ? bestScore : 0)])) as Record<Difficulty, InMemoryBestScoreStore>
  const onExit = vi.fn()
  render(inFrame(<BucketScreen random={alwaysFirstItem} bestScores={bestScores} onExit={onExit} />))
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${level}`, 'i') }))
  return { bestScores: bestScores[level], allBestScores: bestScores, onExit }
}

const item = () => screen.getByRole('button', { name: /^Item:/ })
const bucket = (name: string) => within(screen.getByRole('group', { name: 'Buckets' })).getByRole('button', { name })

function tapItemThenBucket(name: string) {
  fireEvent.click(item())
  fireEvent.click(bucket(name))
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('BucketScreen', () => {
  it('shows an item at the top with a dog, a strawberry, a truck and a teddy bucket below', () => {
    renderBuckets()

    expect(item()).toHaveAccessibleName('Item: cow')
    expect(item()).toHaveTextContent('🐮')
    expect(within(screen.getByRole('group', { name: 'Buckets' })).getAllByRole('button').map((button) => button.textContent)).toEqual([
      expect.stringContaining('🐶'),
      expect.stringContaining('🍓'),
      expect.stringContaining('🚚'),
      expect.stringContaining('🧸'),
    ])
    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
  })

  it('cheers a right bucket, scores and brings the next item', () => {
    renderBuckets()

    tapItemThenBucket('Animals')

    expect(screen.getByRole('alert')).toHaveTextContent('Yes! A cow is an animal.')
    expect(screen.getByRole('status')).toHaveTextContent('Score: 1')
    expect(item()).not.toHaveAccessibleName('Item: cow')
  })

  it('does a nuh-uh for a wrong bucket and keeps the item for another go', () => {
    renderBuckets()

    tapItemThenBucket('Vehicles')

    expect(screen.getByRole('alert')).toHaveTextContent('Nuh-uh')
    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
    expect(item()).toHaveAccessibleName('Item: cow')
  })

  it('does nothing when a bucket is tapped with no item picked up', () => {
    renderBuckets()

    fireEvent.click(bucket('Animals'))

    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
  })

  it('sorts an item dragged to its bucket', () => {
    renderBuckets()
    document.elementFromPoint = () => bucket('Animals')

    fireEvent.pointerDown(item(), { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 80, clientY: 300, pointerId: 1 })
    fireEvent.pointerUp(window, { clientX: 80, clientY: 300, pointerId: 1 })

    expect(screen.getByRole('status')).toHaveTextContent('Score: 1')
  })

  it('sends an item dragged to the wrong bucket back with a nuh-uh', () => {
    renderBuckets()
    document.elementFromPoint = () => bucket('Fruit')

    fireEvent.pointerDown(item(), { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 80, clientY: 300, pointerId: 1 })
    fireEvent.pointerUp(window, { clientX: 80, clientY: 300, pointerId: 1 })

    expect(screen.getByRole('alert')).toHaveTextContent('Nuh-uh')
    expect(item()).toHaveAccessibleName('Item: cow')
  })

  it('lets a dragged item go back quietly when dropped anywhere else', () => {
    renderBuckets()
    document.elementFromPoint = () => document.body

    fireEvent.pointerDown(item(), { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 80, clientY: 300, pointerId: 1 })
    fireEvent.pointerUp(window, { clientX: 80, clientY: 300, pointerId: 1 })

    expect(screen.queryByText(/Nuh-uh/)).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
  })

  it('keeps the best score', () => {
    const { bestScores } = renderBuckets(2)

    tapItemThenBucket('Animals')

    expect(screen.getByRole('note')).toHaveTextContent('Best: 2')
    expect(bestScores.load()).toBe(2)
  })

  it('lets every item be sorted into its own bucket', () => {
    renderBuckets()

    for (let turn = 0; turn < ITEMS.length; turn++) {
      const wanted = ITEMS.find((candidate) => `Item: ${candidate.name}` === item().getAttribute('aria-label'))!.bucket
      tapItemThenBucket({ animals: 'Animals', fruit: 'Fruit', vehicles: 'Vehicles', toys: 'Toys' }[wanted]!)
    }

    expect(screen.getByRole('status')).toHaveTextContent(`Score: ${ITEMS.length}`)
  })

  it('pauses and goes back to the games', () => {
    const { onExit } = renderBuckets()

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    act(() => {})
    fireEvent.click(screen.getByRole('button', { name: /main menu/i }))

    expect(onExit).toHaveBeenCalled()
  })

  it('asks which level to play before any item appears', () => {
    const bestScores = Object.fromEntries(DIFFICULTIES.map((difficulty) => [difficulty, new InMemoryBestScoreStore()])) as Record<Difficulty, InMemoryBestScoreStore>
    render(inFrame(<BucketScreen random={alwaysFirstItem} bestScores={bestScores} onExit={vi.fn()} />))

    const levels = within(screen.getByRole('group', { name: 'Levels' })).getAllByRole('button')

    expect(levels.map((level) => level.textContent)).toEqual([
      expect.stringMatching(/Easy.*🐶.*🍓.*🚚/),
      expect.stringMatching(/Medium.*🐶.*🐟.*🐦/),
      expect.stringMatching(/Hard.*🐶.*🐦.*🐟.*🦋/),
    ])
    expect(screen.queryByRole('button', { name: /^Item:/ })).not.toBeInTheDocument()
  })

  it('plays medium with mammals, fish, birds and reptiles to sort into', () => {
    renderBuckets(0, 'medium')

    expect(item()).toHaveAccessibleName('Item: cow')
    expect(within(screen.getByRole('group', { name: 'Buckets' })).getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual(['Mammals', 'Fish', 'Birds', 'Reptiles'])

    tapItemThenBucket('Mammals')

    expect(screen.getByRole('alert')).toHaveTextContent('Yes! A cow is a mammal.')
  })

  it('teaches that a whale is a mammal on hard, not a fish', () => {
    renderBuckets(0, 'hard')

    expect(item()).toHaveAccessibleName('Item: whale')
    tapItemThenBucket('Fish')
    expect(screen.getByRole('alert')).toHaveTextContent('Nuh-uh')

    tapItemThenBucket('Mammals')
    expect(screen.getByRole('alert')).toHaveTextContent('Yes! A whale is a mammal.')
  })

  it('keeps a best score for each level', () => {
    const { allBestScores } = renderBuckets(0, 'medium')

    tapItemThenBucket('Mammals')

    expect(allBestScores.medium.load()).toBe(1)
    expect(allBestScores.easy.load()).toBe(0)
    expect(allBestScores.hard.load()).toBe(0)
  })
})
