import type { Point } from '../domain/drawing'

/** A smooth line through the points: a curve to the middle of each pair, so corners are rounded off. */
export function strokePath(points: readonly Point[]): string {
  const [first, ...rest] = points
  if (rest.length === 0) return `M${first[0]} ${first[1]}l0 0`
  if (rest.length === 1) return `M${first[0]} ${first[1]}L${rest[0][0]} ${rest[0][1]}`
  const curves = rest.slice(0, -1).map(([x, y], i) => {
    const [nextX, nextY] = rest[i + 1]
    return `Q${x} ${y} ${(x + nextX) / 2} ${(y + nextY) / 2}`
  })
  const last = rest[rest.length - 1]
  return `M${first[0]} ${first[1]}${curves.join('')}L${last[0]} ${last[1]}`
}
