import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import { ITEMS } from '../domain/items'
import { BucketScreen } from './BucketScreen'
import { inFrame } from '../../test-support/inFrame'

/** With every random value at 0 the first item is the first of the list: a cow. */
const alwaysFirstItem = () => 0

function renderBuckets(bestScore = 0) {
  const bestScores = new InMemoryBestScoreStore(bestScore)
  const onExit = vi.fn()
  render(inFrame(<BucketScreen random={alwaysFirstItem} bestScores={bestScores} onExit={onExit} />))
  return { bestScores, onExit }
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
  it('shows an item at the top with a dog, a strawberry and a truck bucket below', () => {
    renderBuckets()

    expect(item()).toHaveAccessibleName('Item: cow')
    expect(item()).toHaveTextContent('🐮')
    expect(within(screen.getByRole('group', { name: 'Buckets' })).getAllByRole('button').map((button) => button.textContent)).toEqual([
      expect.stringContaining('🐶'),
      expect.stringContaining('🍓'),
      expect.stringContaining('🚚'),
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
      tapItemThenBucket({ animals: 'Animals', fruit: 'Fruit', vehicles: 'Vehicles' }[wanted]!)
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
})
