import { describe, expect, it } from 'vitest'
import { DigGame, type DigEvent } from './digGame'
import { DINOSAURS } from './dinosaurs'

const firstEveryTime = () => 0

function newGame(random = firstEveryTime) {
  return new DigGame(DINOSAURS, random)
}

/** Brushes every cell in turn; returns everything that happened. */
function brushEverything(game: DigGame): DigEvent[] {
  const { cells } = game.snapshot()
  return cells.flatMap((_, cell) => game.brush(cell))
}

function digUpEverything(game: DigGame) {
  brushEverything(game)
}

function buildEverything(game: DigGame): DigEvent[] {
  return game.snapshot().tray.flatMap((boneId) => game.place(boneId, boneId))
}

describe('DigGame', () => {
  it('starts with the smallest dinosaur under a field of dirt', () => {
    const snapshot = newGame().snapshot()

    expect(snapshot.phase).toBe('digging')
    expect(snapshot.dinosaur.name).toBe('T-Rex')
    expect(snapshot.cells.every((cell) => !cell.cleared)).toBe(true)
    expect(snapshot.dinosaursBuilt).toBe(0)
  })

  it('clears dirt when it is brushed, once', () => {
    const game = newGame()

    const first = game.brush(0)
    const again = game.brush(0)

    expect(first[0]).toMatchObject({ type: 'dirtBrushed', cell: 0 })
    expect(again).toEqual([])
    expect(game.snapshot().cells[0].cleared).toBe(true)
  })

  it('hides every bone of the dinosaur, each in a different cell', () => {
    const game = newGame()

    const found = brushEverything(game).filter((event) => event.type === 'boneFound')

    expect(found.map((event) => event.bone).sort()).toEqual(DINOSAURS[0].bones.map((bone) => bone.id).sort())
    expect(new Set(found.map((event) => event.cell)).size).toBe(found.length)
  })

  it('puts a found bone in the tray and tells how many are still buried', () => {
    const game = newGame()
    const found = brushEverything(game).find((event) => event.type === 'boneFound')!

    expect(game.snapshot().cells[found.cell].bone).toBe(found.bone)
    expect(game.snapshot().tray).toContain(found.bone)
  })

  it('counts the bones next to an empty cell as a hint', () => {
    const game = newGame()
    const events = brushEverything(game)
    const snapshot = game.snapshot()
    const { cols } = snapshot

    const empties = events.filter((event) => event.type === 'dirtBrushed').map((event) => event.cell)
    const bonesAround = (cell: number) =>
      [-1, 0, 1].flatMap((dy) =>
        [-1, 0, 1].map((dx) => {
          const column = (cell % cols) + dx
          const index = cell + dy * cols + dx
          return column < 0 || column >= cols ? null : snapshot.cells[index]?.bone ?? null
        }),
      ).filter((neighbour, i) => i !== 4 && neighbour !== null).length

    for (const cell of empties) expect(snapshot.cells[cell].nearby).toBe(bonesAround(cell))
  })

  it('moves on to building once the last bone is found', () => {
    const game = newGame()

    const events = brushEverything(game)

    expect(events.at(-1)?.type).toBe('allBonesFound')
    expect(game.snapshot().phase).toBe('building')
  })

  it('does not let you brush while building', () => {
    const game = newGame()
    digUpEverything(game)

    expect(game.brush(0)).toEqual([])
  })

  it('sends a bone back when it goes in the wrong spot', () => {
    const game = newGame()
    digUpEverything(game)

    const events = game.place('skull', 'ribs')

    expect(events).toEqual([{ type: 'wrongSpot', bone: 'skull', spot: 'ribs' }])
    expect(game.snapshot().tray).toContain('skull')
    expect(game.snapshot().placed).toEqual([])
  })

  it('keeps a bone that goes in the right spot', () => {
    const game = newGame()
    digUpEverything(game)

    const events = game.place('skull', 'skull')

    expect(events).toEqual([{ type: 'bonePlaced', bone: 'skull' }])
    expect(game.snapshot().tray).not.toContain('skull')
    expect(game.snapshot().placed).toEqual(['skull'])
  })

  it('ignores a bone that was never found', () => {
    const game = newGame()

    expect(game.place('skull', 'skull')).toEqual([])
  })

  it('builds the dinosaur when the last bone is placed', () => {
    const game = newGame()
    digUpEverything(game)

    const events = buildEverything(game)

    expect(events.at(-1)).toEqual({ type: 'dinosaurBuilt', dinosaur: 't-rex', name: 'T-Rex' })
    expect(game.snapshot().phase).toBe('built')
    expect(game.snapshot().dinosaursBuilt).toBe(1)
  })

  it('digs for the next dinosaur, with more bones, after one is built', () => {
    const game = newGame()
    digUpEverything(game)
    buildEverything(game)

    game.nextDig()

    const snapshot = game.snapshot()
    expect(snapshot.phase).toBe('digging')
    expect(snapshot.dinosaur.id).not.toBe('t-rex')
    expect(snapshot.cells.every((cell) => !cell.cleared)).toBe(true)
    expect(snapshot.tray).toEqual([])
    expect(snapshot.dinosaursBuilt).toBe(1)
  })

  it('does not move on before the dinosaur is built', () => {
    const game = newGame()

    game.nextDig()

    expect(game.snapshot().dinosaur.id).toBe('t-rex')
  })

  it('goes round again after the last dinosaur, smallest first', () => {
    const game = newGame()
    const seen: string[] = []
    for (let i = 0; i < DINOSAURS.length + 1; i++) {
      seen.push(game.snapshot().dinosaur.id)
      digUpEverything(game)
      buildEverything(game)
      game.nextDig()
    }

    expect(seen.slice(0, 4).sort()).toEqual(DINOSAURS.map((dinosaur) => dinosaur.id).sort())
    expect(seen[4]).toBe('t-rex')
    expect(new Set(seen.slice(0, 4)).size).toBe(4)
    const boneCounts = seen.slice(0, 4).map((id) => DINOSAURS.find((dinosaur) => dinosaur.id === id)!.bones.length)
    expect(boneCounts).toEqual([...boneCounts].sort((a, b) => a - b))
  })

  it('buries bones in different places with different randomness', () => {
    const where = (random: () => number) => {
      const game = newGame(random)
      return brushEverything(game).filter((event) => event.type === 'boneFound').map((event) => event.cell)
    }

    expect(where(() => 0)).not.toEqual(where(() => 0.999))
  })
})
