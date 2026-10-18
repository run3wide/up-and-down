import type { GameId } from '../splash/games'

const GAMES: readonly GameId[] = ['up-and-down', 'lemon-volcano', 'dino-race']

/** `base` is where the app is served from, e.g. "/" in development or "/up-and-down/" on GitHub Pages. */
export function gameAtPath(pathname: string, base: string): GameId | null {
  if (!pathname.startsWith(base)) return null
  const slug = pathname.slice(base.length).replace(/\/$/, '')
  return GAMES.find((game) => game === slug) ?? null
}

export function pathFor(game: GameId | null, base: string): string {
  return game === null ? base : `${base}${game}`
}
