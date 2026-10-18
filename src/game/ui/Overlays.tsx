import type { BestScoreResult } from '../application/bestScore'

function Overlay({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overlay">
      <div className="overlay__card" role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function PausedOverlay({ onResume }: { onResume: () => void }) {
  return (
    <Overlay title="Paused">
      <button className="big-button" autoFocus onClick={onResume}>
        Resume
      </button>
    </Overlay>
  )
}

export function GameOverOverlay({ score, result, onPlayAgain }: { score: number; result: BestScoreResult; onPlayAgain: () => void }) {
  return (
    <Overlay title="Game over">
      <p className="overlay__score">Score: {score}</p>
      <p className="overlay__best">Best: {result.best}</p>
      {result.isNewBest && <p className="overlay__new-best">New best! 🎉</p>}
      <button className="big-button" autoFocus onClick={onPlayAgain}>
        Play again
      </button>
    </Overlay>
  )
}
