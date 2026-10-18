import { Maze } from './maze'
import type { MazeLevel } from './mazeRun'

/** Small and twisty: a gentle start. */
const LITTLE_LOOPS = Maze.fromRows([
  '#############',
  '#S#.....*...#',
  '#.#.#.#.###.#',
  '#.#.........#',
  '#.#.#.#.###.#',
  '#.....#.....#',
  '#.#.#.#.#.###',
  '#...#.....#*#',
  '###.#.###.#.#',
  '#...........#',
  '#############',
])

const CLASSIC = Maze.fromRows([
  '###############',
  '#S....#.#.....#',
  '#.##.##.##.##.#',
  '#......*......#',
  '#.##.#####.##.#',
  '#....#...#....#',
  '###.###.###.###',
  '#.............#',
  '#.##.#####.##.#',
  '#.#....*....#.#',
  '#.#.##.#.##.#.#',
  '#.............#',
  '###############',
])

const BIG_GARDEN = Maze.fromRows([
  '#################',
  '#S....#...#...*.#',
  '###.#.###.#.###.#',
  '#...........#...#',
  '#.#.###.#####.#.#',
  '#...........#...#',
  '#.#.#.#.#.#.#.#.#',
  '#...#.#...#.#...#',
  '#.#.#.#.#.#.#.#.#',
  '#...#...#.#...#*#',
  '#.###.###.#.#.#.#',
  '#.......*.#.....#',
  '#################',
])

/** Played in this order, each with a clock that asks for about one and a quarter steps a second. */
export const MAZE_LEVELS: readonly MazeLevel[] = [
  { maze: LITTLE_LOOPS, timeLimit: 80 },
  { maze: CLASSIC, timeLimit: 120 },
  { maze: BIG_GARDEN, timeLimit: 130 },
]
