import type { CSSProperties } from 'react'
import { Dino } from '../../art/Dino'
import type { Cell, Maze } from '../domain/maze'
import { BLAST_RADIUS, STAR_BONUS_SECONDS, type MazeSnapshot } from '../domain/mazeGame'

const DINO_WIDTH_IN_CELLS = 1.7

/** A firework going off where a super star was collected. */
export interface Burst {
  readonly id: number
  readonly cell: Cell
}

interface MazeBoardProps {
  maze: Maze
  snapshot: MazeSnapshot
  facing: 'left' | 'right'
  bursts: readonly Burst[]
}

const SPARKS = 8

/** Drawn in cell units: one cell is 1 x 1 in the SVG, and the dino is positioned in the same units as percentages. */
export function MazeBoard({ maze, snapshot, facing, bursts }: MazeBoardProps) {
  const { rows, columns } = maze
  return (
    <div className="maze__board" style={{ aspectRatio: `${columns} / ${rows}`, '--columns': columns, '--rows': rows } as CSSProperties}>
      <svg viewBox={`0 0 ${columns} ${rows}`} className="maze__drawing" aria-hidden="true">
        {walls(maze).map(({ row, column }) => (
          <rect key={`${row},${column}`} className="maze__wall" x={column} y={row} width="1" height="1" rx="0.2" />
        ))}
        {snapshot.remainingCookies.map(({ row, column }) => (
          <Cookie key={`${row},${column}`} x={column + 0.5} y={row + 0.5} />
        ))}
        {snapshot.remainingStars.map(({ row, column }) => (
          <Star key={`${row},${column}`} x={column + 0.5} y={row + 0.5} />
        ))}
      </svg>
      {bursts.map(({ id, cell }) => (
        <Fireworks key={id} cell={cell} columns={columns} rows={rows} />
      ))}
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

function Star({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon className="maze__star" points={STAR_POINTS} fill="#ffd23f" stroke="#e8890c" strokeWidth="0.05" strokeLinejoin="round" />
    </g>
  )
}

const STAR_POINTS = Array.from({ length: 10 }, (_, i) => {
  const angle = (Math.PI / 5) * i - Math.PI / 2
  const radius = i % 2 === 0 ? 0.36 : 0.16
  return `${(Math.cos(angle) * radius).toFixed(3)},${(Math.sin(angle) * radius).toFixed(3)}`
}).join(' ')

function Fireworks({ cell, columns, rows }: { cell: Cell; columns: number; rows: number }) {
  return (
    <div
      className="maze__burst"
      aria-hidden="true"
      style={{ left: `${((cell.column + 0.5) / columns) * 100}%`, top: `${((cell.row + 0.5) / rows) * 100}%`, '--blast': (BLAST_RADIUS * 2 + 1) / columns } as CSSProperties}
    >
      <span className="maze__burst-ring" />
      {Array.from({ length: SPARKS }, (_, i) => (
        <span key={i} className="maze__spark" style={{ '--angle': `${(360 / SPARKS) * i}deg` } as CSSProperties}>
          ✨
        </span>
      ))}
      <span className="maze__burst-bonus">+{STAR_BONUS_SECONDS}s</span>
    </div>
  )
}
