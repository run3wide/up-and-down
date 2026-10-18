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

export function star(cx: number, cy: number, outer: number) {
  const inner = outer * 0.45
  const points = Array.from({ length: 10 }, (_, i): Point => {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const radius = i % 2 === 0 ? outer : inner
    return [round(cx + radius * Math.cos(angle)), round(cy + radius * Math.sin(angle))]
  })
  return poly(...points)
}
