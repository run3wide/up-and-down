import { describe, expect, it } from 'vitest'
import { Baseplate, type PlacedBrick } from './baseplate'
import { Blueprint, BLUEPRINTS } from './blueprint'
import { BRICK_KINDS, type BrickKind } from './bricks'

const kind = (width: number, colour = '#e53935'): BrickKind => ({ id: `${colour}-${width}`, width, colour })
const placed = (width: number, column: number, layer: number, colour?: string): PlacedBrick => ({ id: `b-${width}-${column}-${layer}`, kind: kind(width, colour), column, layer })

const tower = new Blueprint('tower', 'Tower', [
  { kind: kind(4), column: 4, layer: 0 },
  { kind: kind(2), column: 5, layer: 1 },
])

describe('Blueprint', () => {
  it('starts with nothing built', () => {
    expect(tower.progress([])).toEqual({ built: 0, total: 2 })
    expect(tower.isBuiltOn([])).toBe(false)
  })

  it('counts a piece once a brick of the same width sits where it goes', () => {
    expect(tower.progress([placed(4, 4, 0)])).toEqual({ built: 1, total: 2 })
  })

  it('does not mind which colour the brick is', () => {
    expect(tower.progress([placed(4, 4, 0, '#1e88e5')]).built).toBe(1)
  })

  it('does not count a brick of the wrong width, or in the wrong spot', () => {
    expect(tower.progress([placed(3, 4, 0), placed(4, 5, 0), placed(4, 4, 1)]).built).toBe(0)
  })

  it('is built once every piece is in place', () => {
    expect(tower.isBuiltOn([placed(4, 4, 0), placed(2, 5, 1)])).toBe(true)
  })

  it('is still built when there are extra bricks around it', () => {
    expect(tower.isBuiltOn([placed(4, 4, 0), placed(2, 5, 1), placed(1, 0, 0), placed(3, 8, 0)])).toBe(true)
  })
})

describe('the pictures to build', () => {
  it('starts with a house, a rocket and a truck, easiest first', () => {
    expect(BLUEPRINTS.map((blueprint) => blueprint.name)).toEqual(['House', 'Rocket', 'Truck'])
    const sizes = BLUEPRINTS.map((blueprint) => blueprint.progress([]).total)
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b))
  })

  it.each(BLUEPRINTS.map((blueprint) => [blueprint.name, blueprint] as const))('can really be built: %s', (_name, blueprint) => {
    const plate = new Baseplate()
    for (const piece of [...blueprint.pieces].sort((a, b) => a.layer - b.layer)) plate.drop(piece.kind, piece.column)

    expect(blueprint.isBuiltOn(plate.bricks())).toBe(true)
  })

  it.each(BLUEPRINTS.map((blueprint) => [blueprint.name, blueprint] as const))('only uses bricks from the tray: %s', (_name, blueprint) => {
    for (const piece of blueprint.pieces) expect(BRICK_KINDS).toContainEqual(piece.kind)
  })

  it('has its own name and id for each picture', () => {
    expect(new Set(BLUEPRINTS.map((blueprint) => blueprint.id)).size).toBe(BLUEPRINTS.length)
    expect(new Set(BLUEPRINTS.map((blueprint) => blueprint.name)).size).toBe(BLUEPRINTS.length)
  })
})
