export type ItemKind = 'cone' | 'rock' | 'coin'

export interface CourseItem {
  readonly id: number
  readonly kind: ItemKind
  /** Distance along the road, in world units from the start line. */
  readonly at: number
  /** Sideways position; the road spans 20 to 80. */
  readonly x: number
}

export const FINISH_DISTANCE = 2000
export const COURSE_START_CLEAR = 80
export const ITEM_MIN_X = 28
export const ITEM_MAX_X = 72

const SPACING = 32
const SPACING_VARIATION = 18
const FINISH_RUN_IN = 40
const COIN_GAP = 6

type Random = () => number

/** Builds the whole race up front, so a race is fully decided by the random source it is given. */
export function buildCourse(random: Random): CourseItem[] {
  const items: Omit<CourseItem, 'id'>[] = []
  for (let at = COURSE_START_CLEAR; at < FINISH_DISTANCE - FINISH_RUN_IN; at += SPACING + random() * SPACING_VARIATION) {
    const roll = random()
    if (roll < 0.4) items.push(obstacle(random, at, between(random, ITEM_MIN_X, ITEM_MAX_X)))
    else if (roll < 0.75) items.push(...coinTrio(random, at))
    else items.push(...obstaclePairWithGap(random, at))
  }
  return items.map((item, id) => ({ ...item, id }))
}

function between(random: Random, min: number, max: number): number {
  return min + random() * (max - min)
}

function obstacle(random: Random, at: number, x: number): Omit<CourseItem, 'id'> {
  return { kind: random() < 0.5 ? 'cone' : 'rock', at, x }
}

function coinTrio(random: Random, at: number): Omit<CourseItem, 'id'>[] {
  const x = between(random, ITEM_MIN_X + 2, ITEM_MAX_X - 2)
  return [0, 1, 2].map((row) => ({ kind: 'coin', at: at + row * COIN_GAP, x }))
}

/** Two obstacles with a wide gap between them, so there is always room to drive through. */
function obstaclePairWithGap(random: Random, at: number): Omit<CourseItem, 'id'>[] {
  const left = between(random, ITEM_MIN_X, ITEM_MIN_X + 10)
  const right = left + between(random, 28, 34)
  return [obstacle(random, at, left), obstacle(random, at, right)]
}
