import type { Dinosaur } from './dinosaurs'

export const COLUMNS = 6
export const ROWS = 5

export type Phase = 'digging' | 'building' | 'built'

export type DigEvent =
  | { type: 'dirtBrushed'; cell: number }
  | { type: 'boneFound'; bone: string; cell: number }
  | { type: 'allBonesFound' }
  | { type: 'bonePlaced'; bone: string }
  | { type: 'wrongSpot'; bone: string; spot: string }
  | { type: 'dinosaurBuilt'; dinosaur: string; name: string }

export interface DigCell {
  readonly cleared: boolean
  /** The bone lying here, shown only once the dirt is brushed away. */
  readonly bone: string | null
  /** How many bones are in the cells around this one: a hint for where to brush next. */
  readonly nearby: number
}

export interface DigSnapshot {
  readonly phase: Phase
  readonly dinosaur: Dinosaur
  readonly cols: number
  readonly cells: readonly DigCell[]
  /** Bones that are dug up and waiting to be put together. */
  readonly tray: readonly string[]
  readonly placed: readonly string[]
  readonly dinosaursBuilt: number
}

export class DigGame {
  private readonly dinosaurs: readonly Dinosaur[]
  private readonly random: () => number
  private deck: Dinosaur[] = []
  private dinosaur: Dinosaur
  private buried: (string | null)[] = []
  private cleared: boolean[] = []
  private tray: string[] = []
  private placed: string[] = []
  private dinosaursBuilt = 0

  constructor(dinosaurs: readonly Dinosaur[], random: () => number) {
    this.dinosaurs = dinosaurs
    this.random = random
    this.dinosaur = this.takeDinosaur()
    this.startDig()
  }

  /** Brushing is free and can be done anywhere, as often as you like. */
  brush(cell: number): DigEvent[] {
    if (this.phase() !== 'digging' || this.cleared[cell] !== false) return []
    this.cleared[cell] = true
    const events: DigEvent[] = [{ type: 'dirtBrushed', cell }]
    const bone = this.buried[cell]
    if (bone === null) return events
    this.tray.push(bone)
    events.push({ type: 'boneFound', bone, cell })
    if (this.tray.length === this.dinosaur.bones.length) events.push({ type: 'allBonesFound' })
    return events
  }

  /** A bone in the wrong spot is simply sent back to the tray. */
  place(bone: string, spot: string): DigEvent[] {
    if (this.phase() !== 'building' || !this.tray.includes(bone) || this.placed.includes(spot)) return []
    if (bone !== spot) return [{ type: 'wrongSpot', bone, spot }]
    this.tray = this.tray.filter((inTray) => inTray !== bone)
    this.placed.push(bone)
    const events: DigEvent[] = [{ type: 'bonePlaced', bone }]
    if (this.tray.length === 0) {
      this.dinosaursBuilt += 1
      events.push({ type: 'dinosaurBuilt', dinosaur: this.dinosaur.id, name: this.dinosaur.name })
    }
    return events
  }

  nextDig() {
    if (this.phase() !== 'built') return
    this.dinosaur = this.takeDinosaur()
    this.startDig()
  }

  snapshot(): DigSnapshot {
    return {
      phase: this.phase(),
      dinosaur: this.dinosaur,
      cols: COLUMNS,
      cells: this.buried.map((bone, cell) => ({
        cleared: this.cleared[cell],
        bone: this.cleared[cell] ? bone : null,
        nearby: this.bonesAround(cell),
      })),
      tray: [...this.tray],
      placed: [...this.placed],
      dinosaursBuilt: this.dinosaursBuilt,
    }
  }

  private phase(): Phase {
    if (this.placed.length === this.dinosaur.bones.length) return 'built'
    return this.tray.length + this.placed.length === this.dinosaur.bones.length ? 'building' : 'digging'
  }

  private startDig() {
    const cells = this.shuffled(Array.from({ length: COLUMNS * ROWS }, (_, cell) => cell))
    this.buried = Array.from({ length: COLUMNS * ROWS }, () => null)
    this.dinosaur.bones.forEach((bone, i) => (this.buried[cells[i]] = bone.id))
    this.cleared = this.buried.map(() => false)
    this.tray = []
    this.placed = []
  }

  private bonesAround(cell: number): number {
    const column = cell % COLUMNS
    const row = Math.floor(cell / COLUMNS)
    let count = 0
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const [x, y] = [column + dx, row + dy]
        const inside = x >= 0 && x < COLUMNS && y >= 0 && y < ROWS
        if (inside && (dx !== 0 || dy !== 0) && this.buried[y * COLUMNS + x] !== null) count += 1
      }
    }
    return count
  }

  private takeDinosaur(): Dinosaur {
    if (this.deck.length === 0) this.deck = this.freshDeck()
    return this.deck.shift()!
  }

  /** Dinosaurs with fewer bones first, each size shuffled among itself, so digs get bigger as you go. */
  private freshDeck(): Dinosaur[] {
    const sizes = [...new Set(this.dinosaurs.map((dinosaur) => dinosaur.bones.length))].sort((a, b) => a - b)
    return sizes.flatMap((size) => this.shuffled(this.dinosaurs.filter((dinosaur) => dinosaur.bones.length === size)))
  }

  private shuffled<T>(items: readonly T[]): T[] {
    const result = [...items]
    for (let i = 0; i < result.length - 1; i++) {
      const j = i + Math.floor(this.random() * (result.length - i))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}
