import { useCallback, useEffect, useState } from 'react'
import type { GameId } from '../splash/games'
import { gameAtPath, pathFor } from './gamePaths'

/** The game the address bar points at, and a way to move to another (or back to the picker). */
export function useRoute(base: string): [GameId | null, (game: GameId | null) => void] {
  const [game, setGame] = useState(() => gameAtPath(window.location.pathname, base))

  useEffect(() => {
    const onPopState = () => setGame(gameAtPath(window.location.pathname, base))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [base])

  const navigate = useCallback(
    (next: GameId | null) => {
      window.history.pushState(null, '', pathFor(next, base))
      setGame(next)
    },
    [base],
  )

  return [game, navigate]
}
