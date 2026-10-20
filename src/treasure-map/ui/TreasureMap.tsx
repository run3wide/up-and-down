import { ISLAND_COLUMNS, ISLAND_ROWS, type Spot } from '../domain/island'
import type { TreasureSnapshot } from '../domain/treasureGame'

const MARGIN = 0.7

const centre = (spot: Spot) => ({ x: spot.column + 0.5, y: spot.row + 0.5 })

function Emoji({ spot, children, className, size = 0.7, offset = 0 }: { spot: Spot; children: string; className?: string; size?: number; offset?: number }) {
  const { x, y } = centre(spot)
  return (
    <text className={className} x={x - offset} y={y + offset} textAnchor="middle" dominantBaseline="central" fontSize={size}>
      {children}
    </text>
  )
}

/** The island drawn in spot units, with a compass round the edge so "north" and "east" mean something on the page. */
export function TreasureMap({ snapshot }: { snapshot: TreasureSnapshot }) {
  const { spot, start, landmarks, trail, treasure, clues, clueNumber } = snapshot
  const reached = clues.slice(0, clueNumber - 1).map((clue) => clue.to)

  return (
    <svg
      className="treasure-map__drawing"
      viewBox={`${-MARGIN} ${-MARGIN} ${ISLAND_COLUMNS + MARGIN * 2} ${ISLAND_ROWS + MARGIN * 2}`}
      role="img"
      aria-label="Treasure map"
    >
      <rect className="treasure-map__sea" x={-MARGIN} y={-MARGIN} width={ISLAND_COLUMNS + MARGIN * 2} height={ISLAND_ROWS + MARGIN * 2} />
      {Array.from({ length: ISLAND_ROWS * ISLAND_COLUMNS }, (_, index) => {
        const row = Math.floor(index / ISLAND_COLUMNS)
        const column = index % ISLAND_COLUMNS
        return <rect key={index} className={`treasure-map__sand treasure-map__sand--${(row + column) % 2 ? 'dark' : 'light'}`} x={column} y={row} width="1" height="1" />
      })}
      <g className="treasure-map__compass" aria-hidden="true">
        <text x={ISLAND_COLUMNS / 2} y={-MARGIN / 2} textAnchor="middle" dominantBaseline="central">N</text>
        <text x={ISLAND_COLUMNS / 2} y={ISLAND_ROWS + MARGIN / 2} textAnchor="middle" dominantBaseline="central">S</text>
        <text x={ISLAND_COLUMNS + MARGIN / 2} y={ISLAND_ROWS / 2} textAnchor="middle" dominantBaseline="central">E</text>
        <text x={-MARGIN / 2} y={ISLAND_ROWS / 2} textAnchor="middle" dominantBaseline="central">W</text>
      </g>
      {trail.map((dot, index) => {
        const { x, y } = centre(dot)
        return <circle key={index} className="treasure-map__trail" cx={x} cy={y} r="0.1" />
      })}
      {reached.map((place, index) => {
        const { x, y } = centre(place)
        return <circle key={index} className="treasure-map__reached" cx={x} cy={y} r="0.45" />
      })}
      <circle className="treasure-map__start" cx={centre(start).x} cy={centre(start).y} r="0.46" />
      <Emoji spot={start} size={0.42} offset={0.2}>
        ⛵
      </Emoji>
      {landmarks.map(({ landmark, spot: place }) => (
        <Emoji key={landmark.name} spot={place}>
          {landmark.emoji}
        </Emoji>
      ))}
      {treasure && (
        <Emoji className="treasure-map__treasure" spot={treasure}>
          💰
        </Emoji>
      )}
      <g className="treasure-map__parrot" style={{ transform: `translate(${spot.column}px, ${spot.row}px)` }}>
        <Emoji spot={{ row: 0, column: 0 }}>🦜</Emoji>
      </g>
    </svg>
  )
}
