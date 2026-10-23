export interface NumberSpot {
  readonly x: number
  readonly y: number
  /** How far this spot is from the nearest edge of its part, so big parts can carry big numbers. */
  readonly room: number
}

/** Which part is on top at a point of the 100x100 picture, or null where there is none. */
export type OwnerAt = (x: number, y: number) => number | null

const SIZE = 100

/**
 * Where to write each part's number: the roomiest spot that is really that part (not hidden under one drawn over it).
 * Scans the picture a unit at a time, measures how far each unit is from another part, and takes the deepest one,
 * the one nearest the part's middle when several are as deep.
 */
export function numberSpots(ownerAt: OwnerAt, partCount: number): (NumberSpot | null)[] {
  const owners = Array.from({ length: SIZE * SIZE }, (_, cell) => ownerAt((cell % SIZE) + 0.5, Math.floor(cell / SIZE) + 0.5))
  const depth = distanceFromEdge(owners)
  return Array.from({ length: partCount }, (_, part) => spotFor(part, owners, depth))
}

function spotFor(part: number, owners: readonly (number | null)[], depth: readonly number[]): NumberSpot | null {
  const cells = owners.flatMap((owner, cell) => (owner === part ? [cell] : []))
  if (cells.length === 0) return null
  const deepest = Math.max(...cells.map((cell) => depth[cell]))
  const middle = {
    x: cells.reduce((sum, cell) => sum + (cell % SIZE), 0) / cells.length,
    y: cells.reduce((sum, cell) => sum + Math.floor(cell / SIZE), 0) / cells.length,
  }
  const best = cells
    .filter((cell) => depth[cell] >= deepest - 0.5)
    .reduce((nearest, cell) => (gap(cell, middle) < gap(nearest, middle) ? cell : nearest))
  return { x: (best % SIZE) + 0.5, y: Math.floor(best / SIZE) + 0.5, room: depth[best] }
}

const gap = (cell: number, middle: { x: number; y: number }) => Math.hypot((cell % SIZE) - middle.x, Math.floor(cell / SIZE) - middle.y)

/** For each unit, steps to the nearest unit belonging to something else (or the edge of the picture): two sweeps over the grid. */
function distanceFromEdge(owners: readonly (number | null)[]): number[] {
  const far = SIZE * 2
  const depth = owners.map(() => far)
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= SIZE || y >= SIZE ? 0 : depth[y * SIZE + x])
  const ownerAtCell = (x: number, y: number) => (x < 0 || y < 0 || x >= SIZE || y >= SIZE ? undefined : owners[y * SIZE + x])
  const sweep = (xs: number[], ys: number[], dx: number, dy: number) => {
    for (const y of ys) {
      for (const x of xs) {
        const cell = y * SIZE + x
        const edge = ownerAtCell(x - dx, y) !== owners[cell] || ownerAtCell(x, y - dy) !== owners[cell]
        depth[cell] = edge ? 1 : Math.min(depth[cell], at(x - dx, y) + 1, at(x, y - dy) + 1)
      }
    }
  }
  const forward = Array.from({ length: SIZE }, (_, i) => i)
  const backward = [...forward].reverse()
  sweep(forward, forward, 1, 1)
  sweep(backward, backward, -1, -1)
  return depth
}
