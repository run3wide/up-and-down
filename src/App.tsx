import { useState } from 'react'
import { SplashScreen } from './splash/SplashScreen'

type Screen = 'splash' | 'game'

export function App() {
  const [screen, setScreen] = useState<Screen>('splash')

  if (screen === 'splash') return <SplashScreen onStart={() => setScreen('game')} />
  return <p>Game goes here</p>
}
