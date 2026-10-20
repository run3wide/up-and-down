import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { WebAudioSoundPlayer } from './shared/sound/WebAudioSoundPlayer'
import { LocalStorageSketchStore } from './colouring/infrastructure/LocalStorageSketchStore'
import { LocalStorageGalleryStore } from './colouring/infrastructure/LocalStorageGalleryStore'
import { LocalStorageCollectionStore } from './dino-dig/infrastructure/LocalStorageCollectionStore'
import { LocalStorageBestScoreStore } from './shared/LocalStorageBestScoreStore'
import './index.css'

const bestScores = {
  'up-and-down': new LocalStorageBestScoreStore('up-and-down:best-score'),
  'lemon-volcano': new LocalStorageBestScoreStore('lemon-volcano:best-score'),
  'dino-race': new LocalStorageBestScoreStore('dino-race:best-score'),
  'little-chef': new LocalStorageBestScoreStore('little-chef:best-score'),
  'match-up': new LocalStorageBestScoreStore('match-up:best-score'),
  'cookie-maze': new LocalStorageBestScoreStore('cookie-maze:best-score'),
  'tic-tac-toe': new LocalStorageBestScoreStore('tic-tac-toe:best-score'),
  'spelling-bee': new LocalStorageBestScoreStore('spelling-bee:best-score'),
  'dino-dig': new LocalStorageBestScoreStore('dino-dig:best-score'),
}

// Easy keeps the key the game always used, so existing best scores survive.
const bucketBestScores = {
  easy: new LocalStorageBestScoreStore('put-it-in-the-bucket:best-score'),
  medium: new LocalStorageBestScoreStore('put-it-in-the-bucket:medium:best-score'),
  hard: new LocalStorageBestScoreStore('put-it-in-the-bucket:hard:best-score'),
}

const dinoDigCollection = new LocalStorageCollectionStore('dino-dig:museum')
const colouringGallery = new LocalStorageGalleryStore('colouring:pictures')
const colouringSketches = new LocalStorageSketchStore('colouring:sketch')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App random={Math.random} bestScores={bestScores} bucketBestScores={bucketBestScores} sound={new WebAudioSoundPlayer()} dinoDigCollection={dinoDigCollection} colouringGallery={colouringGallery} colouringSketches={colouringSketches} basePath={import.meta.env.BASE_URL} />
  </StrictMode>,
)
