import { describe, expect, it } from 'vitest'
import { ISLAND_COLUMNS, ISLAND_ROWS, isOnIsland, stepFrom } from './island'

describe('the island', () => {
  it('steps one spot the way of the compass, with north at the top', () => {
    const spot = { row: 2, column: 3 }

    expect(stepFrom(spot, 'north')).toEqual({ row: 1, column: 3 })
    expect(stepFrom(spot, 'south')).toEqual({ row: 3, column: 3 })
    expect(stepFrom(spot, 'east')).toEqual({ row: 2, column: 4 })
    expect(stepFrom(spot, 'west')).toEqual({ row: 2, column: 2 })
  })

  it('ends at the sea: only its own spots are on the island', () => {
    expect(isOnIsland({ row: 0, column: 0 })).toBe(true)
    expect(isOnIsland({ row: ISLAND_ROWS - 1, column: ISLAND_COLUMNS - 1 })).toBe(true)
    expect(isOnIsland({ row: -1, column: 0 })).toBe(false)
    expect(isOnIsland({ row: 0, column: ISLAND_COLUMNS })).toBe(false)
    expect(isOnIsland({ row: ISLAND_ROWS, column: 0 })).toBe(false)
  })
})
