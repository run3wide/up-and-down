export type Compass = 'north' | 'south' | 'east' | 'west'

/** A place on the island map: (0, 0) is the top-left, and north is the top. */
export interface Spot {
  readonly row: number
  readonly column: number
}

export const ISLAND_ROWS = 6
export const ISLAND_COLUMNS = 8

const STEPS: Record<Compass, Spot> = {
  north: { row: -1, column: 0 },
  south: { row: 1, column: 0 },
  east: { row: 0, column: 1 },
  west: { row: 0, column: -1 },
}

export const stepFrom = (spot: Spot, compass: Compass): Spot => ({
  row: spot.row + STEPS[compass].row,
  column: spot.column + STEPS[compass].column,
})

export const isOnIsland = ({ row, column }: Spot): boolean => row >= 0 && row < ISLAND_ROWS && column >= 0 && column < ISLAND_COLUMNS

export const sameSpot = (a: Spot, b: Spot): boolean => a.row === b.row && a.column === b.column
