import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import { MatchGame } from '../domain/matchGame'
import { PICTURES } from '../domain/pictures'
import { MatchScreen } from './MatchScreen'
import { inFrame } from '../../test-support/inFrame'

/** The screen deals the same board as a game built with the same random source, so we can read where things are. */
const anyOrder = () => 0
const STAR = 'Lucky star'
const dealt = () => new MatchGame(PICTURES, anyOrder).snapshot().cards
const PAIRS = 12

function renderMatch() {
  const bestScores = new InMemoryBestScoreStore()
  const onExit = vi.fn()
  render(inFrame(<MatchScreen random={anyOrder} bestScores={bestScores} onExit={onExit} />))
  return { bestScores, onExit }
}

const cards = () => within(screen.getByRole('group', { name: 'Cards' }))

/** Cards are told apart by their place on the board, which stays the same while they turn over. */
const cardAt = (position: number) => cards().getAllByRole('button')[position]
const flip = (position: number) => fireEvent.click(cardAt(position))

function positionsOfAPair(skip = 0): [number, number] {
  const cardsOnBoard = dealt().filter((card) => card.name !== STAR)
  const pairs = [...new Set(cardsOnBoard.map((card) => card.name))].map((name) => cardsOnBoard.filter((card) => card.name === name).map((card) => card.id))
  return pairs[skip] as [number, number]
}

function positionsOfAMiss(): [number, number] {
  const [first, ...rest] = dealt()
  return [first.id, rest.find((card) => card.name !== STAR && card.name !== first.name)!.id]
}

function findPair(skip = 0) {
  for (const position of positionsOfAPair(skip)) flip(position)
}

function findEveryPair() {
  for (let i = 0; i < PAIRS; i++) findPair(i)
}

function miss() {
  for (const position of positionsOfAMiss()) flip(position)
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('MatchScreen', () => {
  it('deals a board of face-down cards, with no hearts to lose', () => {
    renderMatch()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/the same/i)
    expect(cards().getAllByRole('button')).toHaveLength(25)
    expect(cards().getAllByRole('button', { name: /^Hidden card/ })).toHaveLength(24)
    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
    expect(screen.queryByRole('img', { name: /lives left/ })).not.toBeInTheDocument()
  })

  it('numbers the back of each card so a helper can say which to turn over, with a lucky star in the middle', () => {
    renderMatch()

    expect(cardAt(0)).toHaveTextContent('1')
    expect(cardAt(24)).toHaveTextContent('25')
    expect(cardAt(11)).toHaveTextContent('12')
    expect(cardAt(13)).toHaveTextContent('14')
    expect(cardAt(12)).toHaveAccessibleName('Lucky star')
    expect(cardAt(12)).toBeDisabled()
    expect(cards().getAllByRole('button')).toHaveLength(25)
  })

  it('shows what a card is when it is turned over', () => {
    renderMatch()
    const [{ id, name }] = dealt()

    flip(id)

    expect(cardAt(id)).toHaveAccessibleName(name)
  })

  it('keeps a matching pair showing and says it is a match', () => {
    renderMatch()

    findPair()

    const [first, second] = positionsOfAPair()
    expect(cardAt(first)).toBeDisabled()
    expect(cardAt(second)).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent(`A match! ${dealt()[first].face}${dealt()[first].face}`)
    expect(screen.queryByRole('img', { name: /lives left/ })).not.toBeInTheDocument()
  })

  it('gently says two pictures are not the same, and lets the player look at them', () => {
    renderMatch()

    miss()

    const [first, second] = positionsOfAMiss()
    expect(screen.getByRole('alert')).toHaveTextContent(`${dealt()[first].name} and ${dealt()[second].name} are not the same`)
    expect(cardAt(first)).toHaveAccessibleName(dealt()[first].name)
    expect(cardAt(second)).toHaveAccessibleName(dealt()[second].name)
  })

  it('turns a missed pair back over by itself after a moment, so the player can try again', () => {
    renderMatch()
    miss()
    const [first, second] = positionsOfAMiss()

    act(() => void vi.advanceTimersByTime(500))
    expect(cardAt(first)).toHaveAccessibleName(dealt()[first].name)
    act(() => void vi.advanceTimersByTime(700))

    expect(cardAt(first)).toHaveAccessibleName(`Hidden card ${first + 1}`)
    expect(cardAt(second)).toHaveAccessibleName(`Hidden card ${second + 1}`)
    expect(cardAt(first)).toBeEnabled()
  })

  it('keeps a found pair showing when the timer passes', () => {
    renderMatch()
    findPair()
    const [first] = positionsOfAPair()

    act(() => void vi.advanceTimersByTime(5000))

    expect(cardAt(first)).toBeDisabled()
    expect(cardAt(first)).toHaveAccessibleName(dealt()[first].name)
  })

  it('offers the next board once every pair is found, and another 5x5 board after it', () => {
    renderMatch()

    findEveryPair()

    expect(screen.getByRole('alert')).toHaveTextContent(/great/i)
    expect(screen.getByRole('status')).toHaveTextContent('Score: 1')
    fireEvent.click(screen.getByRole('button', { name: 'Next board' }))
    expect(cards().getAllByRole('button', { name: /^Hidden card/ })).toHaveLength(24)
    expect(screen.queryByRole('button', { name: 'Next board' })).not.toBeInTheDocument()
  })

  it('never ends, however many pairs are missed', () => {
    renderMatch()

    for (let i = 0; i < 12; i++) miss()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(cards().getAllByRole('button', { name: /^Hidden card/ }).length).toBeGreaterThan(20)
  })

  it('remembers the best score when a board is cleared', () => {
    const { bestScores } = renderMatch()

    findEveryPair()

    expect(bestScores.load()).toBe(1)
    expect(screen.getByRole('note')).toHaveTextContent('Best: 1')
  })

  it('can be paused, and goes back to the games from there', () => {
    const { onExit } = renderMatch()

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(screen.getByRole('dialog', { name: 'Paused' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    fireEvent.click(screen.getByRole('button', { name: 'Main menu' }))
    expect(onExit).toHaveBeenCalledOnce()
  })
})
