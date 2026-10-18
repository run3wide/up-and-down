import { COLOURS } from '../domain/colours'
import { BRUSHES, type Stroke } from '../domain/drawing'
import { strokePath } from './strokePath'

export function StrokeArt({ strokes }: { strokes: readonly Stroke[] }) {
  return (
    <>
      {strokes.map(({ colour, brush, points }, index) => (
        <path
          key={index}
          d={strokePath(points)}
          className="colouring__stroke"
          stroke={COLOURS.find(({ id }) => id === colour)!.hex}
          strokeWidth={BRUSHES.find(({ id }) => id === brush)!.width}
        />
      ))}
    </>
  )
}
