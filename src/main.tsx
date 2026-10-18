import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { LocalStorageBestScoreStore } from './game/infrastructure/LocalStorageBestScoreStore'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App random={Math.random} bestScores={new LocalStorageBestScoreStore()} />
  </StrictMode>,
)
