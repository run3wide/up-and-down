import { describe, expect, it } from 'vitest'
import { numberSpots } from './partNumbers'

const inBox = (x: number, y: number, [left, top, right, bottom]: number[]) => x >= left && x < right && y >= top && y < bottom

/** Region 0 is the whole page (a sky); region 1 is a square drawn on top of it; region 2 is a tiny dot on top of that. */
const layered = (x: number, y: number): number | null => {
  if (inBox(x, y, [48, 48, 51, 51])) return 2
  if (inBox(x, y, [40, 40, 60, 60])) return 1
  return 0
}

describe('numberSpots', () => {
  it('puts a number in the middle of a part that sits on top', () => {
    const [, square] = numberSpots(layered, 3)

    expect(square!.x).toBeGreaterThan(40)
    expect(square!.x).toBeLessThan(60)
    expect(square!.y).toBeGreaterThan(40)
    expect(square!.y).toBeLessThan(60)
  })

  it('keeps the number of a background part out from under the parts drawn over it', () => {
    const [sky] = numberSpots(layered, 3)

    expect(layered(sky!.x, sky!.y)).toBe(0)
  })

  it('finds a spot even for a tiny part', () => {
    const [, , dot] = numberSpots(layered, 3)

    expect(layered(dot!.x, dot!.y)).toBe(2)
  })

  it('says how much room each spot has, so big parts get big numbers', () => {
    const [sky, square, dot] = numberSpots(layered, 3)

    expect(sky!.room).toBeGreaterThan(square!.room)
    expect(square!.room).toBeGreaterThan(dot!.room)
  })

  it('has no spot for a part that is completely covered', () => {
    const covered = (x: number, y: number) => (inBox(x, y, [0, 0, 100, 100]) ? 1 : null)

    expect(numberSpots(covered, 2)[0]).toBeNull()
  })

  it('picks a spot near the middle of a wide part rather than at its edge', () => {
    const strip = (x: number, y: number) => (inBox(x, y, [10, 40, 90, 60]) ? 0 : null)

    const [spot] = numberSpots(strip, 1)

    expect(spot!.y).toBeGreaterThan(45)
    expect(spot!.y).toBeLessThan(55)
    expect(spot!.room).toBeGreaterThanOrEqual(9)
  })
})
