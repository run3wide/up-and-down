import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { WebAudioSoundPlayer } from './lemon-volcano/infrastructure/WebAudioSoundPlayer'
import { LocalStorageBestScoreStore } from './shared/LocalStorageBestScoreStore'
import './index.css'

const bestScores = {
  'up-and-down': new LocalStorageBestScoreStore('up-and-down:best-score'),
  'lemon-volcano': new LocalStorageBestScoreStore('lemon-volcano:best-score'),
  'turbo-race': new LocalStorageBestScoreStore('turbo-race:best-score'),
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App random={Math.random} bestScores={bestScores} sound={new WebAudioSoundPlayer()} basePath={import.meta.env.BASE_URL} />
  </StrictMode>,
)
