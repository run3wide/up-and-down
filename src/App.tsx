import type { SoundPlayer } from './lemon-volcano/application/SoundPlayer'
import { VolcanoScreen } from './lemon-volcano/ui/VolcanoScreen'
import { mathQuiz } from './dino-race/domain/mathQuestions'
import { RaceScreen } from './dino-race/ui/RaceScreen'
import { KitchenScreen } from './little-chef/ui/KitchenScreen'
import { useRoute } from './routing/useRoute'
import type { BestScoreStore } from './shared/bestScore'
import { SplashScreen } from './splash/SplashScreen'
import type { GameId } from './splash/games'
import { GameScreen } from './up-and-down/ui/GameScreen'

type Random = () => number

interface AppProps {
  random: Random
  bestScores: Record<GameId, BestScoreStore>
  sound: SoundPlayer
  /** Where the app is served from, so each game has its own address under it. */
  basePath: string
}

export function App({ random, bestScores, sound, basePath }: AppProps) {
  const [playing, navigate] = useRoute(basePath)
  const backToGames = () => navigate(null)

  switch (playing) {
    case 'up-and-down':
      return <GameScreen random={random} bestScores={bestScores['up-and-down']} onExit={backToGames} />
    case 'lemon-volcano':
      return <VolcanoScreen random={random} bestScores={bestScores['lemon-volcano']} sound={sound} onExit={backToGames} />
    case 'dino-race':
      return <RaceScreen random={random} bestScores={bestScores['dino-race']} createQuiz={() => mathQuiz(random)} onExit={backToGames} />
    case 'little-chef':
      return <KitchenScreen random={random} bestScores={bestScores['little-chef']} onExit={backToGames} />
    case null:
      return <SplashScreen onPick={navigate} />
  }
}
