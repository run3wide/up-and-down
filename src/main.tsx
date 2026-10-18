import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { LocalStorageBestScoreStore } from './shared/LocalStorageBestScoreStore'
import './index.css'

const bestScores = {
  'up-and-down': new LocalStorageBestScoreStore('up-and-down:best-score'),
  'robot-hoops': new LocalStorageBestScoreStore('robot-hoops:best-score'),
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App random={Math.random} bestScores={bestScores} />
  </StrictMode>,
)
