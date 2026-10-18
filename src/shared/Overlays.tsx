import './overlays.css'

import type { BestScoreResult } from './bestScore'

export function Overlay({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overlay">
      <div className="overlay__card" role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function PausedOverlay({ onResume, onMainMenu }: { onResume: () => void; onMainMenu: () => void }) {
  return (
    <Overlay title="Paused">
      <button className="big-button" autoFocus onClick={onResume}>
        Resume
      </button>
      <button className="big-button big-button--quiet" onClick={onMainMenu}>
        Main menu
      </button>
    </Overlay>
  )
}

interface GameOverOverlayProps {
  score: number
  result: BestScoreResult
  onBackToGames: () => void
  title?: string
  /** A kind word under the title, e.g. for a round that ended without a win. */
  message?: string
}

export function GameOverOverlay({ score, result, onBackToGames, title = 'Game over', message }: GameOverOverlayProps) {
  return (
    <Overlay title={title}>
      {message && <p className="overlay__message">{message}</p>}
      <p className="overlay__score">Score: {score}</p>
      <p className="overlay__best">Best: {result.best}</p>
      {result.isNewBest && <p className="overlay__new-best">New best! 🎉</p>}
      <button className="big-button" autoFocus onClick={onBackToGames}>
        Back to games
      </button>
    </Overlay>
  )
}
