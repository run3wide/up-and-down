import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import { KINDS } from '../domain/kinds'
import { MatchGame } from '../domain/matchGame'
import { MatchScreen } from './MatchScreen'

/** The screen deals the same board as a game built with the same random source, so we can read where things are. */
const anyOrder = () => 0
const dealt = () => new MatchGame(KINDS, anyOrder).snapshot().cards

function renderMatch() {
  const bestScores = new InMemoryBestScoreStore()
  const onExit = vi.fn()
  render(<MatchScreen random={anyOrder} bestScores={bestScores} onExit={onExit} />)
  return { bestScores, onExit }
}

const cards = () => within(screen.getByRole('group', { name: 'Cards' }))
const kindOf = (name: string) => KINDS.find((kind) => kind.items.some((item) => item.name === name))!

/** Cards are told apart by their place on the board, which stays the same while they turn over. */
const cardAt = (position: number) => cards().getAllByRole('button')[position]
const flip = (position: number) => fireEvent.click(cardAt(position))

function positionsOfAPair(skip = 0): [number, number] {
  const pairs = KINDS.map((kind) => dealt().filter((card) => kindOf(card.name) === kind).map((card) => card.id)).filter((ids) => ids.length === 2)
  return pairs[skip] as [number, number]
}

function positionsOfAMiss(): [number, number] {
  const [first, ...rest] = dealt()
  return [first.id, rest.find((card) => kindOf(card.name) !== kindOf(first.name))!.id]
}

function findPair(skip = 0) {
  for (const position of positionsOfAPair(skip)) flip(position)
}

function findEveryPair() {
  for (let i = 0; i < dealt().length / 2; i++) findPair(i)
}

function miss() {
  for (const position of positionsOfAMiss()) flip(position)
}

/** A game that mirrors the screen's, so the test can ask it where things are on the second board. */
function gameOnSecondBoard() {
  const game = new MatchGame(KINDS, anyOrder)
  for (let i = 0; i < dealt().length / 2; i++) positionsOfAPair(i).forEach((id) => game.flip(id))
  game.nextBoard()
  return game
}

function missOnSecondBoard(game: MatchGame) {
  const faceDown = () => game.snapshot().cards.filter((card) => card.state === 'down')
  const first = faceDown()[0]
  game.flip(first.id)
  const second = faceDown().find((card) => kindOf(card.name) !== kindOf(first.name))!
  game.flip(second.id)
  flip(first.id)
  flip(second.id)
}

describe('MatchScreen', () => {
  it('deals a board of face-down cards with full hearts', () => {
    renderMatch()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/alike/i)
    expect(cards().getAllByRole('button')).toHaveLength(6)
    expect(cards().getAllByRole('button', { name: /^Hidden card/ })).toHaveLength(6)
    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
    expect(screen.getByRole('img', { name: '5 lives left' })).toBeInTheDocument()
  })

  it('shows what a card is when it is turned over', () => {
    renderMatch()
    const [{ id, name }] = dealt()

    flip(id)

    expect(cardAt(id)).toHaveAccessibleName(name)
  })

  it('keeps a pair of the same kind showing and says what they have in common', () => {
    renderMatch()

    findPair()

    const [first, second] = positionsOfAPair()
    expect(cardAt(first)).toBeDisabled()
    expect(cardAt(second)).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent(new RegExp(`both are ${kindOf(dealt()[first].name).plural}`, 'i'))
    expect(screen.getByRole('img', { name: '5 lives left' })).toBeInTheDocument()
  })

  it('gently says two things are not alike, takes a heart, and lets the player look at them', () => {
    renderMatch()

    miss()

    const [first, second] = positionsOfAMiss()
    expect(screen.getByRole('alert')).toHaveTextContent(`${dealt()[first].name} and ${dealt()[second].name} are not alike`)
    expect(screen.getByRole('img', { name: '4 lives left' })).toBeInTheDocument()
    expect(cardAt(first)).toHaveAccessibleName(dealt()[first].name)
    expect(cardAt(second)).toHaveAccessibleName(dealt()[second].name)
  })

  it('offers the next board once every pair is found, with a bigger board after it', () => {
    renderMatch()

    findEveryPair()

    expect(screen.getByRole('alert')).toHaveTextContent(/great/i)
    expect(screen.getByRole('status')).toHaveTextContent('Score: 1')
    fireEvent.click(screen.getByRole('button', { name: 'Next board' }))
    expect(cards().getAllByRole('button', { name: /^Hidden card/ })).toHaveLength(8)
    expect(screen.queryByRole('button', { name: 'Next board' })).not.toBeInTheDocument()
  })

  it('ends when the hearts run out, kindly, and remembers the best score', () => {
    const { bestScores } = renderMatch()
    findEveryPair()
    fireEvent.click(screen.getByRole('button', { name: 'Next board' }))
    const secondBoard = gameOnSecondBoard()

    for (let i = 0; i < 5; i++) missOnSecondBoard(secondBoard)

    const gameOver = screen.getByRole('dialog', { name: 'Good try!' })
    expect(gameOver).toHaveTextContent('Score: 1')
    expect(bestScores.load()).toBe(1)
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
