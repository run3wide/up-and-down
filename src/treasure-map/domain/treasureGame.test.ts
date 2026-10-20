import { describe, expect, it } from 'vitest'
import { TreasureGame, cluesForHunt } from './treasureGame'
import type { Hunt } from './hunt'

const PALM = { name: 'palm tree', emoji: '🌴' }
const ROCK = { name: 'big rock', emoji: '🪨' }
const HUT = { name: 'hut', emoji: '🛖' }

/** Start (4,1) → 3 east, 2 north → the palm tree (2,4) → 2 south → treasure (4,4). The big rock is a decoy. */
const hunt: Hunt = {
  start: { row: 4, column: 1 },
  clues: [
    { from: { row: 4, column: 1 }, legs: [{ compass: 'east', steps: 3 }, { compass: 'north', steps: 2 }], to: { row: 2, column: 4 } },
    { from: { row: 2, column: 4 }, legs: [{ compass: 'south', steps: 2 }], to: { row: 4, column: 4 } },
  ],
  landmarks: [
    { landmark: PALM, spot: { row: 2, column: 4 } },
    { landmark: ROCK, spot: { row: 0, column: 0 } },
  ],
  treasure: { row: 4, column: 4 },
}

const otherHunt: Hunt = {
  start: { row: 0, column: 0 },
  clues: [{ from: { row: 0, column: 0 }, legs: [{ compass: 'east', steps: 2 }], to: { row: 0, column: 2 } }],
  landmarks: [{ landmark: HUT, spot: { row: 5, column: 5 } }],
  treasure: { row: 0, column: 2 },
}

function newGame(hunts: Hunt[] = [hunt, otherHunt]) {
  const asked: number[] = []
  const game = new TreasureGame((huntsFound) => {
    asked.push(huntsFound)
    return hunts[Math.min(huntsFound, hunts.length - 1)]
  })
  return { game, asked }
}

function move(game: TreasureGame, ...compasses: Parameters<TreasureGame['move']>[0][]) {
  return compasses.flatMap((compass) => game.move(compass))
}

describe('TreasureGame', () => {
  it('starts with the parrot at the start, on the first clue, and the treasure hidden', () => {
    const snapshot = newGame().game.snapshot()

    expect(snapshot.phase).toBe('hunting')
    expect(snapshot.spot).toEqual(hunt.start)
    expect(snapshot.clue).toEqual(hunt.clues[0])
    expect(snapshot.clueNumber).toBe(1)
    expect(snapshot.clueCount).toBe(2)
    expect(snapshot.treasure).toBeNull()
    expect(snapshot.landmarks).toEqual(hunt.landmarks)
    expect(snapshot.found).toBe(0)
  })

  it('moves the parrot one spot at a time and leaves a trail', () => {
    const { game } = newGame()

    move(game, 'east', 'east')

    expect(game.snapshot().spot).toEqual({ row: 4, column: 3 })
    expect(game.snapshot().trail).toEqual([{ row: 4, column: 1 }, { row: 4, column: 2 }, { row: 4, column: 3 }])
  })

  it('stops at the edge of the island', () => {
    const { game } = newGame()

    const events = move(game, 'west', 'west')

    expect(events).toEqual([])
    expect(game.snapshot().spot).toEqual({ row: 4, column: 0 })
  })

  it('finds the landmark when the steps are counted right, and moves on to the next clue', () => {
    const { game } = newGame()

    const events = move(game, 'east', 'east', 'east', 'north', 'north')

    expect(events).toEqual([{ type: 'landmarkFound', landmark: PALM }])
    expect(game.snapshot().clueNumber).toBe(2)
    expect(game.snapshot().clue).toEqual(hunt.clues[1])
    expect(game.snapshot().trail).toEqual([{ row: 2, column: 4 }])
  })

  it('does not mind which way round the steps are taken', () => {
    const { game } = newGame()

    const events = move(game, 'north', 'north', 'east', 'east', 'east')

    expect(events).toEqual([{ type: 'landmarkFound', landmark: PALM }])
  })

  it('walks past a landmark that is not the one the clue points to, and nothing happens', () => {
    const { game } = newGame()

    const events = move(game, 'north', 'north', 'north', 'north', 'west', 'west', 'west', 'west')

    expect(events).toEqual([])
    expect(game.snapshot().clueNumber).toBe(1)
  })

  it('finds the treasure at the end of the last clue, scores, and shows it', () => {
    const { game } = newGame()

    const events = move(game, 'east', 'east', 'east', 'north', 'north', 'south', 'south')

    expect(events).toEqual([{ type: 'landmarkFound', landmark: PALM }, { type: 'treasureFound' }])
    expect(game.snapshot().phase).toBe('found')
    expect(game.snapshot().found).toBe(1)
    expect(game.snapshot().treasure).toEqual(hunt.treasure)
  })

  it('does not move the parrot once the treasure is found', () => {
    const { game } = newGame()
    move(game, 'east', 'east', 'east', 'north', 'north', 'south', 'south')

    expect(game.move('north')).toEqual([])
    expect(game.snapshot().spot).toEqual(hunt.treasure)
  })

  it('takes the parrot back to where the clue began, for free', () => {
    const { game } = newGame()
    move(game, 'east', 'east', 'east', 'north', 'north', 'south', 'east', 'east')

    game.backToClueStart()

    expect(game.snapshot().spot).toEqual({ row: 2, column: 4 })
    expect(game.snapshot().clueNumber).toBe(2)
    expect(game.snapshot().trail).toEqual([{ row: 2, column: 4 }])
    expect(game.snapshot().found).toBe(0)
  })

  it('digs a new hunt after the treasure, asking for one that fits how many have been found', () => {
    const { game, asked } = newGame()
    move(game, 'east', 'east', 'east', 'north', 'north', 'south', 'south')

    game.nextHunt()

    expect(game.snapshot().phase).toBe('hunting')
    expect(game.snapshot().spot).toEqual(otherHunt.start)
    expect(game.snapshot().found).toBe(1)
    expect(game.snapshot().treasure).toBeNull()
    expect(asked).toEqual([0, 1])
  })

  it('ignores nextHunt while the treasure is still hidden', () => {
    const { game, asked } = newGame()

    game.nextHunt()

    expect(asked).toEqual([0])
    expect(game.snapshot().spot).toEqual(hunt.start)
  })
})

describe('cluesForHunt', () => {
  it('starts with two clues and adds one every two treasures, up to four', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 20].map(cluesForHunt)).toEqual([2, 2, 3, 3, 4, 4, 4, 4])
  })
})
