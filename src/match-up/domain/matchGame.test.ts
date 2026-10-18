import { describe, expect, it } from 'vitest'
import { KINDS } from './kinds'
import { MAX_LIVES, MatchGame, type MatchEvent } from './matchGame'
import type { Kind } from './kinds'

const item = (name: string) => ({ name, face: '·' })

const fruits: Kind = { id: 'fruit', plural: 'fruits', items: [item('Apple'), item('Banana'), item('Grape')] }
const animals: Kind = { id: 'animal', plural: 'animals', items: [item('Cat'), item('Dog'), item('Cow')] }
const numbers: Kind = { id: 'number', plural: 'numbers', items: [item('One'), item('Two'), item('Three')] }
const colours: Kind = { id: 'colour', plural: 'colours', items: [item('Red'), item('Blue'), item('Green')] }
const small = [fruits, animals, numbers, colours]

const manyKinds = (count: number): Kind[] =>
  Array.from({ length: count }, (_, k) => ({ id: `kind${k}`, plural: `kind${k}s`, items: ['a', 'b', 'c'].map((letter) => item(`${letter}${k}`)) }))

const anyOrder = () => 0

function kindOf(kinds: readonly Kind[], name: string) {
  return kinds.find((kind) => kind.items.some((it) => it.name === name))!.id
}

/** The ids of the two cards on the board that are the same kind. */
function aPair(game: MatchGame, kinds: readonly Kind[] = small, skip = 0): [number, number] {
  const open = game.snapshot().cards.filter((card) => card.state === 'down')
  const pairs = kinds
    .map((kind) => open.filter((card) => kindOf(kinds, card.name) === kind.id))
    .filter((cards) => cards.length === 2)
  const [a, b] = pairs[skip]
  return [a.id, b.id]
}

/** Two cards of different kinds. */
function aMismatch(game: MatchGame, kinds: readonly Kind[] = small): [number, number] {
  const open = game.snapshot().cards.filter((card) => card.state === 'down')
  const first = open[0]
  const other = open.find((card) => kindOf(kinds, card.name) !== kindOf(kinds, first.name))!
  return [first.id, other.id]
}

function flipBoth(game: MatchGame, [a, b]: [number, number]): MatchEvent[] {
  return [...game.flip(a), ...game.flip(b)]
}

/** Flips a card, then one of a different kind. Works while an earlier miss is still showing. */
function missOnce(game: MatchGame, kinds: readonly Kind[] = small): MatchEvent[] {
  const down = () => game.snapshot().cards.filter((card) => card.state === 'down')
  const first = down()[0]
  const events = game.flip(first.id)
  const other = down().find((card) => kindOf(kinds, card.name) !== kindOf(kinds, first.name))!
  return [...events, ...game.flip(other.id)]
}

function clearBoard(game: MatchGame, kinds: readonly Kind[] = small) {
  while (game.snapshot().cards.some((card) => card.state === 'down')) flipBoth(game, aPair(game, kinds))
}

describe('MatchGame', () => {
  it('starts with a board of face-down cards, full lives and nothing cleared', () => {
    const game = new MatchGame(small, anyOrder)

    const snapshot = game.snapshot()
    expect(snapshot).toMatchObject({ phase: 'playing', lives: MAX_LIVES, boardsCleared: 0, pairsTotal: 4, pairsFound: 0 })
    expect(snapshot.cards).toHaveLength(8)
    expect(snapshot.cards.every((card) => card.state === 'down')).toBe(true)
  })

  it('deals exactly two cards of each kind, and they are different things', () => {
    const game = new MatchGame(small, anyOrder)

    for (const kind of small) {
      const names = game
        .snapshot()
        .cards.filter((card) => kindOf(small, card.name) === kind.id)
        .map((card) => card.name)
      expect(names).toHaveLength(2)
      expect(new Set(names).size).toBe(2)
    }
  })

  it('turns a card face up when it is flipped', () => {
    const game = new MatchGame(small, anyOrder)

    expect(game.flip(0)).toEqual([{ type: 'cardFlipped', card: 0 }])

    expect(game.snapshot().cards[0].state).toBe('up')
  })

  it('ignores flipping the same card twice', () => {
    const game = new MatchGame(small, anyOrder)
    game.flip(0)

    expect(game.flip(0)).toEqual([])
  })

  it('ignores a card that is not on the board', () => {
    const game = new MatchGame(small, anyOrder)

    expect(game.flip(99)).toEqual([])
  })

  it('keeps two cards of the same kind face up and says what they have in common', () => {
    const game = new MatchGame(small, anyOrder)
    const [a, b] = aPair(game)

    const events = flipBoth(game, [a, b])

    expect(events).toEqual([
      { type: 'cardFlipped', card: a },
      { type: 'cardFlipped', card: b },
      expect.objectContaining({ type: 'pairFound', kind: expect.stringMatching(/^(fruits|animals|numbers|colours)$/) }),
    ])
    const snapshot = game.snapshot()
    expect(snapshot.cards[a].state).toBe('matched')
    expect(snapshot.cards[b].state).toBe('matched')
    expect(snapshot).toMatchObject({ pairsFound: 1, lives: MAX_LIVES })
  })

  it('takes a heart for two cards that are not alike, and keeps them showing so they can be remembered', () => {
    const game = new MatchGame(small, anyOrder)
    const [a, b] = aMismatch(game)
    const names = [game.snapshot().cards[a].name, game.snapshot().cards[b].name]

    const events = flipBoth(game, [a, b])

    expect(events.at(-1)).toEqual({ type: 'pairMissed', first: names[0], second: names[1] })
    const snapshot = game.snapshot()
    expect(snapshot.cards[a].state).toBe('up')
    expect(snapshot.cards[b].state).toBe('up')
    expect(snapshot.lives).toBe(MAX_LIVES - 1)
  })

  it('turns a missed pair back over on the next flip', () => {
    const game = new MatchGame(small, anyOrder)
    const [a, b] = aMismatch(game)
    flipBoth(game, [a, b])
    const next = game.snapshot().cards.find((card) => card.state === 'down')!

    game.flip(next.id)

    const cards = game.snapshot().cards
    expect(cards[a].state).toBe('down')
    expect(cards[b].state).toBe('down')
    expect(cards[next.id].state).toBe('up')
  })

  it('does not take a heart twice for the same missed pair', () => {
    const game = new MatchGame(small, anyOrder)
    const [a, b] = aMismatch(game)
    flipBoth(game, [a, b])

    game.flip(a)

    expect(game.snapshot().lives).toBe(MAX_LIVES - 1)
  })

  it('ends the board when every pair is found, without scoring until the player moves on', () => {
    const game = new MatchGame(small, anyOrder)
    clearBoard(game)

    expect(game.snapshot()).toMatchObject({ phase: 'cleared', boardsCleared: 1, pairsFound: 4 })
  })

  it('announces a cleared board right after the last pair', () => {
    const game = new MatchGame(small, anyOrder)
    clearBoardExceptLastPair(game)

    const events = flipBoth(game, aPair(game))

    expect(events.map((event) => event.type)).toEqual(['cardFlipped', 'cardFlipped', 'pairFound', 'boardCleared'])
  })

  it('gives a heart back for a cleared board, up to the most hearts', () => {
    const game = new MatchGame(small, anyOrder)
    flipBoth(game, aMismatch(game))
    clearBoard(game)

    game.nextBoard()

    expect(game.snapshot().lives).toBe(MAX_LIVES)
    clearBoard(game)
    game.nextBoard()
    expect(game.snapshot().lives).toBe(MAX_LIVES)
  })

  it('deals boards that are always full rows of four cards, growing to a 4x4 square', () => {
    const kinds = manyKinds(8)
    const game = new MatchGame(kinds, anyOrder)
    const sizes: number[] = []

    for (let board = 0; board < 5; board++) {
      sizes.push(game.snapshot().cards.length)
      clearBoard(game, kinds)
      game.nextBoard()
    }

    expect(sizes).toEqual([8, 12, 16, 16, 16])
  })

  it('deals a fresh face-down board after a cleared one', () => {
    const game = new MatchGame(small, anyOrder)
    clearBoard(game)
    game.nextBoard()

    const snapshot = game.snapshot()
    expect(snapshot).toMatchObject({ phase: 'playing', pairsFound: 0, boardsCleared: 1 })
    expect(snapshot.cards.every((card) => card.state === 'down')).toBe(true)
  })

  it('never deals more pairs than there are kinds', () => {
    const game = new MatchGame(small, anyOrder)
    clearBoard(game)
    game.nextBoard()

    expect(game.snapshot().pairsTotal).toBe(4)
  })

  it('ignores nextBoard while a board is still being played', () => {
    const game = new MatchGame(small, anyOrder)
    game.flip(0)

    game.nextBoard()

    expect(game.snapshot().cards[0].state).toBe('up')
  })

  it('ends the game when the hearts run out, and then stops listening', () => {
    const game = new MatchGame(small, anyOrder)
    let events: MatchEvent[] = []
    for (let i = 0; i < MAX_LIVES; i++) events = missOnce(game)

    expect(events.at(-1)).toEqual({ type: 'gameOver' })
    expect(game.snapshot()).toMatchObject({ phase: 'over', lives: 0 })
    expect(game.flip(game.snapshot().cards.find((card) => card.state === 'down')!.id)).toEqual([])
  })

  it('plays with the real kinds: each has enough different things to fill a board', () => {
    expect(KINDS.length).toBeGreaterThanOrEqual(8)
    for (const kind of KINDS) expect(kind.items.length).toBeGreaterThanOrEqual(4)
    const names = KINDS.flatMap((kind) => kind.items.map((it) => it.name))
    expect(new Set(names).size).toBe(names.length)
  })
})

function clearBoardExceptLastPair(game: MatchGame) {
  while (game.snapshot().cards.filter((card) => card.state === 'down').length > 2) flipBoth(game, aPair(game))
}
