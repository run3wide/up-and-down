import type { ReactNode } from 'react'
import type { Cake } from '../domain/bakeGame'

const PLAIN_SPONGE = '#f3e5d0'
const DEPTH = 6
/** The frosting stops short of the edge so a rim of sponge shows round the whole shape. */
const FROSTING_SCALE = 0.86

type Point = readonly [number, number]

interface ShapeArt {
  /** The outline of the cake as one or more paths in a 100x70 box. */
  readonly outline: readonly string[]
  /** Eyes, stripes, fins: drawn on the frosting, in their own natural colours. */
  readonly features: ReactNode
  /** Where toppings land, all inside the outline. */
  readonly spots: readonly Point[]
  /** Drawn behind and in front of the cake, never frosted (wheels, leaves). */
  readonly extras?: ReactNode
}

const SHAPE_ART: Record<string, ShapeArt> = {
  Dinosaur: {
    outline: ['M8 40 C14 36 22 34 30 30 C34 18 46 14 58 18 C64 8 78 6 86 10 C94 12 96 20 90 24 C86 27 80 26 76 28 C74 36 70 42 68 48 L70 62 L58 62 L56 52 C50 54 44 54 38 52 L36 62 L24 62 L26 48 C18 48 12 46 8 40 Z'],
    features: (
      <>
        <path d="M34 28 L38 18 L43 25 L48 14 L53 22 L58 14 L62 22 L58 28 Z" fill="#2f9e44" />
        <circle cx="84" cy="15" r="2.6" fill="#1d2b53" />
        <path d="M80 22 Q86 25 92 21" fill="none" stroke="#1d2b53" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
    spots: [[36, 40], [48, 32], [58, 40], [46, 45], [82, 17]],
  },
  Strawberry: {
    outline: ['M50 64 C20 54 8 34 15 22 C22 11 40 13 50 20 C60 13 78 11 85 22 C92 34 80 54 50 64 Z'],
    features: (
      <>
        <path d="M50 22 L38 8 L47 14 L50 2 L53 14 L62 8 Z" fill="#2f9e44" />
        {[[34, 30], [66, 30], [50, 34], [42, 46], [58, 46], [50, 56]].map(([x, y]) => (
          <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="1.4" ry="2" fill="#fff3b0" />
        ))}
      </>
    ),
    spots: [[30, 36], [44, 28], [62, 34], [70, 42], [50, 46]],
  },
  'Race car': {
    outline: ['M6 46 L6 38 C6 34 10 32 16 31 L30 30 L40 16 C42 14 44 13 48 13 L66 13 C70 13 72 15 74 18 L80 30 L92 32 C96 33 96 36 96 40 L96 46 C96 48 94 50 92 50 L8 50 C6 50 6 48 6 46 Z'],
    features: (
      <>
        <path d="M43 28 L49 17 L64 17 L70 28 Z" fill="#a5d8ff" stroke="#1d2b53" strokeWidth="1.2" />
        <rect x="44" y="36" width="10" height="3" rx="1.5" fill="#fff" opacity="0.7" />
        <circle cx="92" cy="38" r="2.6" fill="#ffe066" />
      </>
    ),
    extras: (
      <>
        {[24, 76].map((x) => (
          <g key={x}>
            <circle cx={x} cy="52" r="9" fill="#2b2b3a" />
            <circle cx={x} cy="52" r="4" fill="#ced4da" />
          </g>
        ))}
      </>
    ),
    spots: [[16, 40], [34, 42], [52, 44], [70, 42], [88, 41]],
  },
  Fish: {
    outline: [
      'M24 35 C24 18 44 10 62 12 C80 14 92 26 92 35 C92 44 80 56 62 58 C44 60 24 52 24 35 Z',
      'M28 35 L6 14 L11 35 L6 56 Z',
      'M46 14 L56 2 L68 13 Z',
    ],
    features: (
      <>
        <circle cx="79" cy="29" r="3.4" fill="#fff" />
        <circle cx="80" cy="29" r="1.8" fill="#1d2b53" />
        <path d="M68 24 Q64 35 68 46" fill="none" stroke="#1d2b53" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
        <path d="M86 40 Q90 41 92 38" fill="none" stroke="#1d2b53" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
    spots: [[38, 34], [50, 24], [50, 44], [60, 34], [34, 44]],
  },
  Shark: {
    outline: [
      'M20 36 C30 20 54 14 72 20 C84 24 94 32 96 36 C86 40 76 42 66 46 C50 52 32 50 20 36 Z',
      'M24 36 L4 16 C8 26 9 34 11 36 C9 38 8 46 4 56 Z',
      'M50 18 L58 2 L68 20 Z',
      'M54 48 L48 60 L66 46 Z',
    ],
    features: (
      <>
        <circle cx="82" cy="30" r="2.4" fill="#1d2b53" />
        <path d="M70 38 L76 36 L78 40 L84 37 L86 40 L92 37" fill="#fff" stroke="#1d2b53" strokeWidth="1" strokeLinejoin="round" />
        {[44, 48, 52].map((x) => (
          <path key={x} d={`M${x} 28 Q${x - 2} 33 ${x} 38`} fill="none" stroke="#1d2b53" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        ))}
      </>
    ),
    spots: [[32, 34], [58, 28], [60, 40], [46, 40], [72, 28]],
  },
  Tiger: {
    outline: [
      'M22 38 A28 26 0 1 0 78 38 A28 26 0 1 0 22 38 Z',
      'M16 16 A10 10 0 1 0 36 16 A10 10 0 1 0 16 16 Z',
      'M64 16 A10 10 0 1 0 84 16 A10 10 0 1 0 64 16 Z',
    ],
    features: (
      <>
        <path d="M50 16 L46 28 L50 26 L54 28 Z" fill="#3d2b1f" />
        <path d="M38 18 L42 28 L36 26 Z M62 18 L58 28 L64 26 Z M24 34 L34 38 L24 40 Z M76 34 L66 38 L76 40 Z" fill="#3d2b1f" />
        <ellipse cx="50" cy="52" rx="13" ry="9" fill="#fff" />
        <circle cx="38" cy="34" r="3" fill="#1d2b53" />
        <circle cx="62" cy="34" r="3" fill="#1d2b53" />
        <path d="M46 46 L54 46 L50 51 Z" fill="#ff8fab" />
        <path d="M50 51 L50 55 M50 55 Q46 59 43 56 M50 55 Q54 59 57 56" fill="none" stroke="#1d2b53" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
    spots: [[30, 26], [70, 26], [24, 46], [76, 46], [50, 60]],
  },
}

const SPRINKLE_COLOURS = ['#ff6b81', '#4dabf7', '#ffd43b', '#ffffff', '#69db7c']
const CANDY_COLOURS = ['#ff4d4d', '#339af0', '#ffd43b', '#51cf66', '#ff922b']

const TOPPING_ART: Record<string, (point: Point, index: number) => ReactNode> = {
  Sprinkles: ([x, y], index) => (
    <g key={index} transform={`translate(${x} ${y})`}>
      {[-3, 0, 3].map((dx, i) => (
        <rect key={dx} x={dx - 0.7} y={-2.4 + (i % 2) * 2} width="1.4" height="4.6" rx="0.7" fill={SPRINKLE_COLOURS[(index + i) % SPRINKLE_COLOURS.length]} transform={`rotate(${(index * 47 + i * 61) % 180} ${dx} 0)`} />
      ))}
    </g>
  ),
  'Chocolate cookies': ([x, y], index) => (
    <g key={index} transform={`translate(${x} ${y})`}>
      <circle r="3.8" fill="#3d2b1f" stroke="#1f140d" strokeWidth="0.5" />
      <circle cx="-1.2" cy="-1" r="0.7" fill="#fff8e7" />
      <circle cx="1.3" cy="0.4" r="0.7" fill="#fff8e7" />
      <circle cx="-0.4" cy="1.6" r="0.7" fill="#fff8e7" />
    </g>
  ),
  'Candy buttons': ([x, y], index) => (
    <g key={index} transform={`translate(${x} ${y})`}>
      <circle r="3.2" fill={CANDY_COLOURS[index % CANDY_COLOURS.length]} stroke="#0003" strokeWidth="0.5" />
      <circle cx="-1" cy="-1.1" r="0.9" fill="#fff" opacity="0.7" />
    </g>
  ),
  'Peanut butter cups': ([x, y], index) => (
    <g key={index} transform={`translate(${x} ${y})`}>
      <circle r="3.8" fill="#8a4b14" stroke="#5c300c" strokeWidth="0.7" strokeDasharray="1.3 0.8" />
      <circle r="2.2" fill="#c68642" />
    </g>
  ),
  'Caramel bars': ([x, y], index) => (
    <g key={index} transform={`translate(${x} ${y}) rotate(${(index % 2 ? 18 : -14)})`}>
      <rect x="-4.4" y="-2" width="8.8" height="4" rx="1.2" fill="#6b3e1f" />
      <rect x="-3.6" y="-1" width="7.2" height="1.5" rx="0.7" fill="#e0a64a" />
    </g>
  ),
}

/** The cake as it looks from above: the sponge shows round the edge, the frosting sits on top, and toppings are scattered over it. */
export function CakeArt({ cake }: { cake: Cake }) {
  const { shape, flavour, frosting, topping } = cake
  const art = shape ? SHAPE_ART[shape.name] : undefined
  if (!shape || !art) return <p className="cake-art__empty" aria-hidden="true">🎂</p>

  const sponge = flavour?.colour ?? PLAIN_SPONGE
  const top = frosting?.colour ?? sponge
  const toppingArt = topping ? TOPPING_ART[topping.name] : undefined

  return (
    <svg className="cake-art" viewBox="0 0 100 70" aria-hidden="true" data-shape={shape.name}>
      <ellipse cx="50" cy="66" rx="42" ry="3.5" fill="#0002" />
      {art.extras}
      <g fill={sponge} stroke="#0003" strokeWidth="1" strokeLinejoin="round">
        {art.outline.map((d) => (
          <g key={`side-${d}`} transform={`translate(0 ${DEPTH})`}>
            <path d={d} />
            <path d={d} fill="#00000030" stroke="none" />
          </g>
        ))}
        {art.outline.map((d) => (
          <path key={d} d={d} data-part="sponge" fill={sponge} />
        ))}
      </g>
      <g transform={`translate(50 35) scale(${FROSTING_SCALE}) translate(-50 -35)`}>
        {art.outline.map((d) => (
          <path key={d} d={d} data-part="frosting" fill={top} stroke="#0002" strokeWidth="1.1" strokeLinejoin="round" />
        ))}
        {art.features}
        {toppingArt && art.spots.map((spot, index) => <g key={index} data-topping={topping!.name}>{toppingArt(spot, index)}</g>)}
      </g>
    </svg>
  )
}
