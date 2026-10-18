/** Path builders, so a template reads as shapes rather than as strings of numbers. */
type Point = readonly [number, number]

const round = (n: number) => Math.round(n * 100) / 100

export const poly = (...points: Point[]) => `M${points.map(([x, y]) => `${x} ${y}`).join('L')}Z`

export const rect = (x: number, y: number, width: number, height: number) =>
  poly([x, y], [x + width, y], [x + width, y + height], [x, y + height])

export const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`

export const circle = (cx: number, cy: number, r: number) => ellipse(cx, cy, r, r)

/** Several shapes that are one part, like the puffs of a cloud. */
export const together = (...paths: string[]) => paths.join(' ')

/** A horizontal stripe across a circle, following its curve, like the bands of a planet. */
export function band(cx: number, cy: number, r: number, top: number, bottom: number) {
  const halfWidth = (y: number) => round(Math.sqrt(r * r - (y - cy) ** 2))
  const [topHalf, bottomHalf] = [halfWidth(top), halfWidth(bottom)]
  return (
    `M${round(cx - topHalf)} ${top}L${round(cx + topHalf)} ${top}` +
    `A${r} ${r} 0 0 1 ${round(cx + bottomHalf)} ${bottom}` +
    `L${round(cx - bottomHalf)} ${bottom}A${r} ${r} 0 0 1 ${round(cx - topHalf)} ${top}Z`
  )
}

export function star(cx: number, cy: number, outer: number) {
  const inner = outer * 0.45
  const points = Array.from({ length: 10 }, (_, i): Point => {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const radius = i % 2 === 0 ? outer : inner
    return [round(cx + radius * Math.cos(angle)), round(cy + radius * Math.sin(angle))]
  })
  return poly(...points)
}
