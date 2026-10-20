import { ISLAND_COLUMNS, ISLAND_ROWS, sameSpot, type Compass, type Spot } from './island'

export interface Landmark {
  readonly name: string
  readonly emoji: string
}

export const LANDMARKS: readonly Landmark[] = [
  { name: 'palm tree', emoji: '🌴' },
  { name: 'big rock', emoji: '🪨' },
  { name: 'hut', emoji: '🛖' },
  { name: 'lighthouse', emoji: '🗼' },
  { name: 'mountain', emoji: '⛰️' },
  { name: 'shell', emoji: '🐚' },
  { name: 'crab', emoji: '🦀' },
  { name: 'tent', emoji: '⛺' },
  { name: 'flower', emoji: '🌺' },
  { name: 'cactus', emoji: '🌵' },
]

export interface Leg {
  readonly compass: Compass
  readonly steps: number
}

/** "3 steps east, then 2 steps north": how to get from one place to the next. */
export interface Clue {
  readonly from: Spot
  readonly legs: readonly Leg[]
  readonly to: Spot
}

export interface PlacedLandmark {
  readonly landmark: Landmark
  readonly spot: Spot
}

/** `clues` lead from the start, through a landmark each, to the treasure. The other landmarks are there to look at, not to find. */
export interface Hunt {
  readonly start: Spot
  readonly clues: readonly Clue[]
  readonly landmarks: readonly PlacedLandmark[]
  readonly treasure: Spot
}

/** Along the row first, then up or down the column. */
export function legsBetween(from: Spot, to: Spot): Leg[] {
  const legs: Leg[] = []
  if (to.column !== from.column) legs.push({ compass: to.column > from.column ? 'east' : 'west', steps: Math.abs(to.column - from.column) })
  if (to.row !== from.row) legs.push({ compass: to.row > from.row ? 'south' : 'north', steps: Math.abs(to.row - from.row) })
  return legs
}

export function describeLegs(legs: readonly Leg[]): string {
  return legs.map(({ steps, compass }) => `${steps} ${steps === 1 ? 'step' : 'steps'} ${compass}`).join(', then ')
}

/** Too close and a clue is a guess; too far and a young player loses count. */
const MIN_DISTANCE = 2
const MAX_DISTANCE = 7
const DECOYS = 3

const distance = (a: Spot, b: Spot) => Math.abs(a.row - b.row) + Math.abs(a.column - b.column)

export function buildHunt(clueCount: number, random: () => number): Hunt {
  const route = pickRoute(clueCount + 1, random)
  const [start, ...stops] = route
  const waypoints = stops.slice(0, -1)
  const treasure = stops[stops.length - 1]
  const decoys = shuffled(allSpots().filter((spot) => !route.some((used) => sameSpot(used, spot))), random).slice(0, DECOYS)
  const kinds = shuffled(LANDMARKS, random)
  const landmarks = [...waypoints, ...decoys].map((spot, index) => ({ landmark: kinds[index], spot }))
  const clues = stops.map((to, index) => {
    const from = index === 0 ? start : stops[index - 1]
    return { from, legs: legsBetween(from, to), to }
  })
  return { start, clues, landmarks, treasure }
}

/** Walks a shuffled island taking the first spot a good clue's distance from the last, so any random source finishes. */
function pickRoute(length: number, random: () => number): Spot[] {
  const spots = shuffled(allSpots(), random)
  const route = [spots[0]]
  while (route.length < length) {
    const last = route[route.length - 1]
    const next = spots.find((spot) => !route.some((used) => sameSpot(used, spot)) && isGoodClueDistance(last, spot))
    route.push(next ?? spots.find((spot) => !route.some((used) => sameSpot(used, spot)))!)
  }
  return route
}

const isGoodClueDistance = (from: Spot, to: Spot) => distance(from, to) >= MIN_DISTANCE && distance(from, to) <= MAX_DISTANCE

function allSpots(): Spot[] {
  return Array.from({ length: ISLAND_ROWS * ISLAND_COLUMNS }, (_, index) => ({ row: Math.floor(index / ISLAND_COLUMNS), column: index % ISLAND_COLUMNS }))
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items]
  for (let i = 0; i < result.length - 1; i++) {
    const j = i + Math.floor(random() * (result.length - i))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
