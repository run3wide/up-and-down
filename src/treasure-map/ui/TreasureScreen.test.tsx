import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import type { SoundPlayer } from '../../shared/sound/SoundPlayer'
import { inFrame } from '../../test-support/inFrame'
import type { Hunt } from '../domain/hunt'
import { TreasureScreen } from './TreasureScreen'

/** Start (4,1) → 3 east, 2 north → the palm tree (2,4) → 2 south → treasure (4,4). */
const hunt: Hunt = {
  start: { row: 4, column: 1 },
  clues: [
    { from: { row: 4, column: 1 }, legs: [{ compass: 'east', steps: 3 }, { compass: 'north', steps: 2 }], to: { row: 2, column: 4 } },
    { from: { row: 2, column: 4 }, legs: [{ compass: 'south', steps: 2 }], to: { row: 4, column: 4 } },
  ],
  landmarks: [
    { landmark: { name: 'palm tree', emoji: '🌴' }, spot: { row: 2, column: 4 } },
    { landmark: { name: 'big rock', emoji: '🪨' }, spot: { row: 0, column: 0 } },
  ],
  treasure: { row: 4, column: 4 },
}
const nextHunt: Hunt = {
  start: { row: 0, column: 0 },
  clues: [{ from: { row: 0, column: 0 }, legs: [{ compass: 'east', steps: 2 }], to: { row: 0, column: 2 } }],
  landmarks: [],
  treasure: { row: 0, column: 2 },
}

function renderHunt(bestScore = 0) {
  const bestScores = new InMemoryBestScoreStore(bestScore)
  const sound = { unlock: vi.fn<SoundPlayer['unlock']>(), play: vi.fn<SoundPlayer['play']>() }
  const onExit = vi.fn()
  const newHunt = vi.fn((huntsFound: number) => (huntsFound === 0 ? hunt : nextHunt))
  render(inFrame(<TreasureScreen newHunt={newHunt} bestScores={bestScores} sound={sound} onExit={onExit} />))
  return { bestScores, sound, onExit, newHunt }
}

const fly = (...compasses: string[]) => compasses.forEach((compass) => fireEvent.click(screen.getByRole('button', { name: `Fly ${compass}` })))
const findPalmTree = () => fly('east', 'east', 'east', 'north', 'north')
const findTreasure = () => {
  findPalmTree()
  fly('south', 'south')
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('TreasureScreen', () => {
  it('shows the first clue in steps and a map with its landmarks, and the treasure hidden', () => {
    renderHunt()

    expect(screen.getByRole('region', { name: 'Clue' })).toHaveTextContent('3 steps east, then 2 steps north')
    expect(screen.getByRole('region', { name: 'Clue' })).toHaveTextContent('Clue 1 of 2')
    expect(screen.getByRole('img', { name: /treasure map/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /treasure map/i })).toHaveTextContent('🌴')
    expect(screen.getByRole('img', { name: /treasure map/i })).not.toHaveTextContent('💰')
    expect(screen.getByRole('status')).toHaveTextContent('Treasure: 0')
  })

  it('has a button for every way of the compass', () => {
    renderHunt()

    for (const compass of ['north', 'south', 'east', 'west']) expect(screen.getByRole('button', { name: `Fly ${compass}` })).toBeInTheDocument()
  })

  it('flies the right number of steps to a landmark and shows the next clue', () => {
    const { sound } = renderHunt()

    findPalmTree()

    expect(screen.getByRole('alert')).toHaveTextContent('palm tree')
    expect(screen.getByRole('region', { name: 'Clue' })).toHaveTextContent('2 steps south')
    expect(screen.getByRole('region', { name: 'Clue' })).toHaveTextContent('Clue 2 of 2')
    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  it('also flies with the arrow keys and W A S D', () => {
    renderHunt()

    for (const key of ['ArrowRight', 'd', 'D', 'ArrowUp', 'w']) fireEvent.keyDown(window, { key })

    expect(screen.getByRole('alert')).toHaveTextContent('palm tree')
  })

  it('finds the treasure, scores, and keeps the best', () => {
    const { bestScores, sound } = renderHunt()

    findTreasure()

    expect(screen.getByRole('dialog', { name: 'Treasure!' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Treasure: 1')
    expect(screen.getByRole('img', { name: /treasure map/i })).toHaveTextContent('💰')
    expect(bestScores.load()).toBe(1)
    expect(sound.play).toHaveBeenLastCalledWith('builtIt')
  })

  it('does not make a sound that is muted', () => {
    const { sound } = renderHunt()
    fireEvent.click(screen.getByRole('button', { name: 'Mute sound' }))

    findTreasure()

    expect(sound.play).not.toHaveBeenCalled()
  })

  it('goes back to the start of a clue for free', () => {
    renderHunt()
    fly('east', 'east', 'south')

    fireEvent.click(screen.getByRole('button', { name: 'Back to the start of this clue' }))
    findPalmTree()

    expect(screen.getByRole('alert')).toHaveTextContent('palm tree')
  })

  it('digs a new hunt for the next treasure', () => {
    const { newHunt } = renderHunt()
    findTreasure()

    fireEvent.click(screen.getByRole('button', { name: 'Next treasure' }))

    expect(newHunt).toHaveBeenLastCalledWith(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Clue' })).toHaveTextContent('2 steps east')
  })

  it('does not fly while paused, and pauses and goes back to the games', () => {
    const { onExit } = renderHunt()
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    act(() => {})

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByRole('dialog', { name: 'Paused' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /main menu/i }))

    expect(onExit).toHaveBeenCalled()
  })
})
