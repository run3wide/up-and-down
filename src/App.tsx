import { useState } from 'react'
import type { BestScoreStore } from './game/application/bestScore'
import type { Random } from './game/domain/game'
import { GameScreen } from './game/ui/GameScreen'
import { SplashScreen } from './splash/SplashScreen'

type Screen = 'splash' | 'game'

interface AppProps {
  random: Random
  bestScores: BestScoreStore
}

export function App({ random, bestScores }: AppProps) {
  const [screen, setScreen] = useState<Screen>('splash')

  if (screen === 'splash') return <SplashScreen onStart={() => setScreen('game')} />
  return <GameScreen random={random} bestScores={bestScores} />
}
