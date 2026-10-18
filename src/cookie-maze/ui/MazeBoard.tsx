import { Dino } from '../../art/Dino'
import type { Maze } from '../domain/maze'
import type { MazeSnapshot } from '../domain/mazeGame'

const DINO_WIDTH_IN_CELLS = 1.7

interface MazeBoardProps {
  maze: Maze
  snapshot: MazeSnapshot
  facing: 'left' | 'right'
}

/** Drawn in cell units: one cell is 1 x 1 in the SVG, and the dino is positioned in the same units as percentages. */
export function MazeBoard({ maze, snapshot, facing }: MazeBoardProps) {
  const { rows, columns } = maze
  return (
    <div className="maze__board" style={{ aspectRatio: `${columns} / ${rows}` }}>
      <svg viewBox={`0 0 ${columns} ${rows}`} className="maze__drawing" aria-hidden="true">
        {walls(maze).map(({ row, column }) => (
          <rect key={`${row},${column}`} className="maze__wall" x={column} y={row} width="1" height="1" rx="0.2" />
        ))}
        {snapshot.remainingCookies.map(({ row, column }) => (
          <Cookie key={`${row},${column}`} x={column + 0.5} y={row + 0.5} />
        ))}
      </svg>
      <div
        className="maze__dino"
        data-facing={facing}
        style={{
          left: `${((snapshot.x + 0.5) / columns) * 100}%`,
          top: `${((snapshot.y + 0.5) / rows) * 100}%`,
          width: `${(DINO_WIDTH_IN_CELLS / columns) * 100}%`,
        }}
      >
        <Dino mood={snapshot.phase === 'won' ? 'cheer' : 'idle'} />
      </div>
    </div>
  )
}

function walls(maze: Maze) {
  const cells = Array.from({ length: maze.rows * maze.columns }, (_, i) => ({ row: Math.floor(i / maze.columns), column: i % maze.columns }))
  return cells.filter((cell) => !maze.isOpen(cell))
}

function Cookie({ x, y }: { x: number; y: number }) {
  return (
    <g className="maze__cookie" transform={`translate(${x} ${y})`}>
      <circle r="0.2" fill="#d9a05b" stroke="#a8692e" strokeWidth="0.04" />
      <circle cx="-0.07" cy="-0.06" r="0.04" fill="#5b3418" />
      <circle cx="0.08" cy="-0.02" r="0.04" fill="#5b3418" />
      <circle cx="-0.02" cy="0.09" r="0.04" fill="#5b3418" />
    </g>
  )
}
