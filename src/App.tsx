import { VolcanoScreen } from './lemon-volcano/ui/VolcanoScreen'
import { useRoute } from './routing/useRoute'
import type { BestScoreStore } from './shared/bestScore'
import { SplashScreen } from './splash/SplashScreen'
import type { GameId } from './splash/games'
import { GameScreen } from './up-and-down/ui/GameScreen'

type Random = () => number

interface AppProps {
  random: Random
  bestScores: Record<GameId, BestScoreStore>
  /** Where the app is served from, so each game has its own address under it. */
  basePath: string
}

export function App({ random, bestScores, basePath }: AppProps) {
  const [playing, navigate] = useRoute(basePath)
  const backToGames = () => navigate(null)

  switch (playing) {
    case 'up-and-down':
      return <GameScreen random={random} bestScores={bestScores['up-and-down']} onExit={backToGames} />
    case 'lemon-volcano':
      return <VolcanoScreen random={random} bestScores={bestScores['lemon-volcano']} onExit={backToGames} />
    case null:
      return <SplashScreen onPick={navigate} />
  }
}
