import { describe, expect, it } from 'vitest'
import { describeLegs, buildHunt, legsBetween, type Hunt } from './hunt'
import { isOnIsland, stepFrom, type Spot } from './island'

/** A small repeatable random source, so every seed is a different map and the same seed is the same map. */
function seeded(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

const SEEDS = Array.from({ length: 60 }, (_, seed) => seed)
const sameSpot = (a: Spot, b: Spot) => a.row === b.row && a.column === b.column

function walk(from: Spot, hunt: Hunt['clues'][number]): Spot {
  let spot = from
  for (const leg of hunt.legs) for (let step = 0; step < leg.steps; step++) spot = stepFrom(spot, leg.compass)
  return spot
}

describe('legsBetween', () => {
  it('goes along the row first, then up or down the column', () => {
    expect(legsBetween({ row: 4, column: 1 }, { row: 2, column: 4 })).toEqual([
      { compass: 'east', steps: 3 },
      { compass: 'north', steps: 2 },
    ])
    expect(legsBetween({ row: 1, column: 5 }, { row: 3, column: 2 })).toEqual([
      { compass: 'west', steps: 3 },
      { compass: 'south', steps: 2 },
    ])
  })

  it('leaves out a leg that would be no steps', () => {
    expect(legsBetween({ row: 1, column: 1 }, { row: 1, column: 4 })).toEqual([{ compass: 'east', steps: 3 }])
    expect(legsBetween({ row: 1, column: 1 }, { row: 0, column: 1 })).toEqual([{ compass: 'north', steps: 1 }])
  })
})

describe('describeLegs', () => {
  it('says the steps in words a child can count', () => {
    expect(describeLegs([{ compass: 'east', steps: 3 }, { compass: 'north', steps: 1 }])).toBe('3 steps east, then 1 step north')
    expect(describeLegs([{ compass: 'west', steps: 2 }])).toBe('2 steps west')
  })
})

describe('buildHunt', () => {
  it.each(SEEDS)('lays out a map that can really be followed (seed %i)', (seed) => {
    const clueCount = 2 + (seed % 3)
    const hunt = buildHunt(clueCount, seeded(seed))

    expect(hunt.clues).toHaveLength(clueCount)
    expect(hunt.clues[0].from).toEqual(hunt.start)
    hunt.clues.forEach((clue, index) => {
      expect(walk(clue.from, clue)).toEqual(clue.to)
      expect(clue.legs.length).toBeGreaterThan(0)
      if (index > 0) expect(clue.from).toEqual(hunt.clues[index - 1].to)
    })
    expect(hunt.clues[clueCount - 1].to).toEqual(hunt.treasure)
  })

  it.each(SEEDS)('keeps everything on the island and no two things on one spot (seed %i)', (seed) => {
    const hunt = buildHunt(2 + (seed % 3), seeded(seed))
    const spots = [hunt.start, hunt.treasure, ...hunt.landmarks.map((placed) => placed.spot)]

    expect(spots.every(isOnIsland)).toBe(true)
    expect(spots.filter((spot, index) => spots.findIndex((other) => sameSpot(spot, other)) !== index)).toEqual([])
  })

  it.each(SEEDS)('puts a landmark at the end of every clue but the last, and none on the treasure (seed %i)', (seed) => {
    const hunt = buildHunt(2 + (seed % 3), seeded(seed))
    const atSpot = (spot: Spot) => hunt.landmarks.find((placed) => sameSpot(placed.spot, spot))

    hunt.clues.slice(0, -1).forEach((clue) => expect(atSpot(clue.to)).toBeDefined())
    expect(atSpot(hunt.treasure)).toBeUndefined()
    expect(new Set(hunt.landmarks.map((placed) => placed.landmark.name)).size).toBe(hunt.landmarks.length)
  })

  it.each(SEEDS)('never sets a clue of just one step, which would be too easy to guess (seed %i)', (seed) => {
    const hunt = buildHunt(3, seeded(seed))

    for (const clue of hunt.clues) expect(clue.legs.reduce((total, leg) => total + leg.steps, 0)).toBeGreaterThanOrEqual(2)
  })

  it('draws the same map from the same random source', () => {
    expect(buildHunt(3, seeded(7))).toEqual(buildHunt(3, seeded(7)))
  })

  it('still finishes when the random source never changes', () => {
    expect(buildHunt(4, () => 0).clues).toHaveLength(4)
    expect(buildHunt(4, () => 0.999).clues).toHaveLength(4)
  })
})
