import { useState } from 'react'
import type { BestScoreStore } from './shared/bestScore'
import { HoopsScreen } from './robot-hoops/ui/HoopsScreen'
import { SplashScreen } from './splash/SplashScreen'
import type { GameId } from './splash/games'
import { GameScreen } from './up-and-down/ui/GameScreen'

type Random = () => number

interface AppProps {
  random: Random
  bestScores: Record<GameId, BestScoreStore>
}

export function App({ random, bestScores }: AppProps) {
  const [playing, setPlaying] = useState<GameId | null>(null)
  const backToGames = () => setPlaying(null)

  switch (playing) {
    case 'up-and-down':
      return <GameScreen random={random} bestScores={bestScores['up-and-down']} onExit={backToGames} />
    case 'robot-hoops':
      return <HoopsScreen random={random} bestScores={bestScores['robot-hoops']} onExit={backToGames} />
    case null:
      return <SplashScreen onPick={setPlaying} />
  }
}
