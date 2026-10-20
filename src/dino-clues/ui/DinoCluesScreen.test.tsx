import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import { inFrame } from '../../test-support/inFrame'
import { MYSTERIES } from '../domain/mysteries'
import { DinoCluesScreen } from './DinoCluesScreen'

/** With every random value at 0 nothing is shuffled: the banana mystery first, its clues in the tree, rock and bucket, choices as written. */
const unshuffled = () => 0

function renderClues(bestScore = 0) {
  const bestScores = new InMemoryBestScoreStore(bestScore)
  const sound = { unlock: vi.fn(), play: vi.fn() }
  const onExit = vi.fn()
  render(inFrame(<DinoCluesScreen random={unshuffled} bestScores={bestScores} sound={sound} onExit={onExit} />))
  return { bestScores, sound, onExit }
}

const place = (name: RegExp | string) => within(screen.getByRole('group', { name: 'Hiding places' })).getByRole('button', { name })
const choice = (name: string) => within(screen.getByRole('group', { name: 'Choices' })).getByRole('button', { name })
const findAllClues = () => ['tree', 'rock', 'bucket'].forEach((name) => fireEvent.click(place(`Look in the ${name}`)))

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('DinoCluesScreen', () => {
  it('asks the question, with places to look and three empty clue slots', () => {
    renderClues()

    expect(screen.getByRole('heading')).toHaveTextContent(MYSTERIES[0].question)
    expect(within(screen.getByRole('group', { name: 'Hiding places' })).getAllByRole('button').length).toBeGreaterThan(3)
    expect(within(screen.getByRole('region', { name: 'Clues' })).getAllByRole('listitem')).toHaveLength(3)
    expect(screen.queryByRole('group', { name: 'Choices' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Solved: 0')
  })

  it('shows a clue in the notebook when a place has one', () => {
    const { sound } = renderClues()

    fireEvent.click(place('Look in the tree'))

    expect(screen.getByRole('region', { name: 'Clues' })).toHaveTextContent('It is yellow.')
    expect(screen.getByRole('alert')).toHaveTextContent('Clue 1')
    expect(place('The tree: found a clue')).toBeDisabled()
    expect(sound.play).toHaveBeenCalledTimes(1)
  })

  it('says kindly when a place has nothing, and leaves it looked in', () => {
    renderClues()

    fireEvent.click(place('Look in the tent'))

    expect(screen.getByRole('alert')).toHaveTextContent('Nothing in the tent')
    expect(place('The tent: nothing here')).toBeDisabled()
  })

  it('asks Dino to think, with three choices, once all three clues are found', () => {
    renderClues()

    findAllClues()

    expect(screen.getByRole('alert')).toHaveTextContent('Time to think')
    expect(within(screen.getByRole('group', { name: 'Choices' })).getAllByRole('button').map((button) => button.getAttribute('aria-label'))).toEqual(['banana', 'apple', 'cookie'])
    expect(place('Look in the cactus')).toBeDisabled()
  })

  it('sends a wrong choice back with a nuh-uh and no penalty', () => {
    renderClues()
    findAllClues()

    fireEvent.click(choice('apple'))

    expect(screen.getByRole('alert')).toHaveTextContent('Nuh-uh')
    expect(screen.getByRole('status')).toHaveTextContent('Solved: 0')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(choice('banana')).toBeEnabled()
  })

  it('cheers the right choice, scores, keeps the best and makes a sound', () => {
    const { bestScores, sound } = renderClues()
    findAllClues()
    sound.play.mockClear()

    fireEvent.click(choice('banana'))

    expect(screen.getByRole('dialog', { name: 'You solved it!' })).toHaveTextContent('It is a banana!')
    expect(screen.getByRole('status')).toHaveTextContent('Solved: 1')
    expect(bestScores.load()).toBe(1)
    expect(sound.play).toHaveBeenCalledWith('victoryRoar')
  })

  it('makes no sound when muted', () => {
    const { sound } = renderClues()
    fireEvent.click(screen.getByRole('button', { name: 'Mute sound' }))

    findAllClues()
    fireEvent.click(choice('banana'))

    expect(sound.play).not.toHaveBeenCalled()
  })

  it('brings the next mystery with every place to look in again', () => {
    renderClues()
    findAllClues()
    fireEvent.click(choice('banana'))

    fireEvent.click(screen.getByRole('button', { name: 'Next mystery' }))

    expect(screen.getByRole('heading')).toHaveTextContent(MYSTERIES[1].question)
    expect(place('Look in the tree')).toBeEnabled()
    expect(screen.queryByRole('group', { name: 'Choices' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Clues' })).not.toHaveTextContent('It is yellow.')
  })

  it('can be paused, and goes back to the games from the pause card', () => {
    const { onExit } = renderClues()

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    act(() => {})

    expect(place('Look in the tree')).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /main menu/i }))
    expect(onExit).toHaveBeenCalled()
  })
})
