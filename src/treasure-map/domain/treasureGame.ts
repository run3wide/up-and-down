import { type Clue, type Hunt, type Landmark, type PlacedLandmark } from './hunt'
import { isOnIsland, sameSpot, stepFrom, type Compass, type Spot } from './island'

export type TreasurePhase = 'hunting' | 'found'

export type TreasureEvent = { type: 'landmarkFound'; landmark: Landmark } | { type: 'treasureFound' }

export interface TreasureSnapshot {
  readonly phase: TreasurePhase
  readonly spot: Spot
  readonly start: Spot
  readonly clues: readonly Clue[]
  readonly clue: Clue
  readonly clueNumber: number
  readonly clueCount: number
  readonly landmarks: readonly PlacedLandmark[]
  /** Where the parrot has flown since this clue began. */
  readonly trail: readonly Spot[]
  /** Hidden until it is found. */
  readonly treasure: Spot | null
  /** Treasures found so far: the score. */
  readonly found: number
}

/** Two clues to begin with, and one more for every two treasures found, up to four. */
export const cluesForHunt = (huntsFound: number): number => Math.min(2 + Math.floor(huntsFound / 2), 4)

export class TreasureGame {
  private readonly newHunt: (huntsFound: number) => Hunt
  private hunt: Hunt
  private clueIndex = 0
  private spot: Spot
  private trail: Spot[]
  private phase: TreasurePhase = 'hunting'
  private found = 0

  constructor(newHunt: (huntsFound: number) => Hunt) {
    this.newHunt = newHunt
    this.hunt = newHunt(0)
    this.spot = this.hunt.start
    this.trail = [this.spot]
  }

  /** The parrot flies one spot. Counting wrong costs nothing: only the spot the clue points to counts. */
  move(compass: Compass): TreasureEvent[] {
    if (this.phase !== 'hunting') return []
    const next = stepFrom(this.spot, compass)
    if (!isOnIsland(next)) return []
    this.spot = next
    this.trail.push(next)
    return sameSpot(next, this.clue.to) ? this.arrive() : []
  }

  backToClueStart(): void {
    if (this.phase !== 'hunting') return
    this.beginClue(this.clue.from)
  }

  nextHunt(): void {
    if (this.phase !== 'found') return
    this.hunt = this.newHunt(this.found)
    this.clueIndex = 0
    this.phase = 'hunting'
    this.beginClue(this.hunt.start)
  }

  snapshot(): TreasureSnapshot {
    return {
      phase: this.phase,
      spot: this.spot,
      start: this.hunt.start,
      clues: this.hunt.clues,
      clue: this.clue,
      clueNumber: this.clueIndex + 1,
      clueCount: this.hunt.clues.length,
      landmarks: this.hunt.landmarks,
      trail: this.trail,
      treasure: this.phase === 'found' ? this.hunt.treasure : null,
      found: this.found,
    }
  }

  private get clue(): Clue {
    return this.hunt.clues[this.clueIndex]
  }

  private arrive(): TreasureEvent[] {
    const isLastClue = this.clueIndex === this.hunt.clues.length - 1
    if (isLastClue) {
      this.phase = 'found'
      this.found += 1
      return [{ type: 'treasureFound' }]
    }
    const landmark = this.hunt.landmarks.find((placed) => sameSpot(placed.spot, this.spot))!.landmark
    this.clueIndex += 1
    this.beginClue(this.spot)
    return [{ type: 'landmarkFound', landmark }]
  }

  private beginClue(spot: Spot): void {
    this.spot = spot
    this.trail = [spot]
  }
}
