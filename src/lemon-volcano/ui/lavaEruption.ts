export interface LavaSplat {
  readonly id: number
  readonly left: number
  readonly top: number
  readonly size: number
  readonly delay: number
}

/** How long a splat takes to stick, then roll off the bottom of the screen, before it is removed. */
export const SPLAT_LIFETIME_MILLISECONDS = 5200

const SPLATS_PER_ERUPTION = 7

/** Spread across the screen, shifted each eruption so no two look the same. Cosmetic only, so no game randomness. */
export function lavaSplatsForEruption(eruption: number, firstId: number): LavaSplat[] {
  return Array.from({ length: SPLATS_PER_ERUPTION }, (_, i) => ({
    id: firstId + i,
    left: 6 + ((eruption * 23 + i * 37) % 82),
    top: 8 + ((eruption * 11 + i * 17) % 52),
    size: 3.2 + ((eruption + i * 5) % 6) * 0.9,
    delay: i * 0.06,
  }))
}
