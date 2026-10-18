import { describe, expect, it } from 'vitest'
import { Baseplate, COLUMNS, MAX_LAYERS, snapColumn } from './baseplate'
import type { BrickKind } from './bricks'

const brick = (width: number): BrickKind => ({ id: `red-${width}`, width, colour: '#e53935' })

describe('Baseplate', () => {
  it('lands a brick on the plate, on the bottom layer', () => {
    const plate = new Baseplate()

    const result = plate.drop(brick(2), 3)

    expect(result).toMatchObject({ type: 'placed', brick: { column: 3, layer: 0 } })
  })

  it('stacks a brick dropped over another on the layer above', () => {
    const plate = new Baseplate()
    plate.drop(brick(2), 3)

    const result = plate.drop(brick(2), 3)

    expect(result).toMatchObject({ type: 'placed', brick: { layer: 1 } })
  })

  it('lets bricks sit side by side on the same layer', () => {
    const plate = new Baseplate()
    plate.drop(brick(2), 0)

    const result = plate.drop(brick(2), 2)

    expect(result).toMatchObject({ type: 'placed', brick: { layer: 0 } })
  })

  it('rests an overhanging brick on the highest brick it touches', () => {
    const plate = new Baseplate()
    plate.drop(brick(1), 4)
    plate.drop(brick(1), 4)

    const result = plate.drop(brick(3), 2)

    expect(result).toMatchObject({ type: 'placed', brick: { layer: 2 } })
  })

  it('rejects a brick that would hang off the edge of the plate', () => {
    const plate = new Baseplate()

    expect(plate.drop(brick(3), COLUMNS - 2)).toEqual({ type: 'rejected', reason: 'offThePlate' })
    expect(plate.drop(brick(3), -1)).toEqual({ type: 'rejected', reason: 'offThePlate' })
  })

  it('rejects a brick on top of a full tower', () => {
    const plate = new Baseplate()
    for (let layer = 0; layer < MAX_LAYERS; layer++) plate.drop(brick(1), 0)

    expect(plate.drop(brick(1), 0)).toEqual({ type: 'rejected', reason: 'towerTooHigh' })
  })

  it('tells where a brick would land, so the player can see it before letting go', () => {
    const plate = new Baseplate()
    plate.drop(brick(2), 0)

    expect(plate.landingLayer(brick(2), 1)).toBe(1)
    expect(plate.landingLayer(brick(2), 4)).toBe(0)
    expect(plate.landingLayer(brick(2), COLUMNS)).toBeNull()
  })

  it('drops the bricks above one that is taken out', () => {
    const plate = new Baseplate()
    const bottom = plate.drop(brick(2), 0)
    plate.drop(brick(2), 0)
    if (bottom.type !== 'placed') throw new Error('expected the brick to land')

    plate.remove(bottom.brick.id)

    expect(plate.bricks()).toHaveLength(1)
    expect(plate.bricks()[0]).toMatchObject({ column: 0, layer: 0 })
  })

  it('keeps a brick up when something else still holds it', () => {
    const plate = new Baseplate()
    const left = plate.drop(brick(1), 0)
    plate.drop(brick(1), 1)
    plate.drop(brick(2), 0)
    if (left.type !== 'placed') throw new Error('expected the brick to land')

    plate.remove(left.brick.id)

    expect(plate.bricks().find((placed) => placed.kind.width === 2)).toMatchObject({ layer: 1 })
  })

  it('ignores taking out a brick that is not there', () => {
    const plate = new Baseplate()
    plate.drop(brick(2), 0)

    plate.remove('nope')

    expect(plate.bricks()).toHaveLength(1)
  })

  it('clears the plate to start again', () => {
    const plate = new Baseplate()
    plate.drop(brick(2), 0)

    plate.clear()

    expect(plate.bricks()).toEqual([])
  })
})

describe('snapColumn', () => {
  it('centres the brick under the finger', () => {
    expect(snapColumn(2, 5)).toBe(4)
    expect(snapColumn(3, 5.4)).toBe(4)
  })

  it('rounds to the nearest stud', () => {
    expect(snapColumn(1, 3.4)).toBe(3)
    expect(snapColumn(1, 3.6)).toBe(3)
  })

  it('keeps the brick on the plate, however far the finger strays', () => {
    expect(snapColumn(4, -3)).toBe(0)
    expect(snapColumn(4, COLUMNS + 5)).toBe(COLUMNS - 4)
  })
})
