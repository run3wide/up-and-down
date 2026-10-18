import { Hearts } from '../../shared/Hearts'
import { MAX_LIVES } from '../domain/game'

export function Hud({ score, lives, onPause }: { score: number; lives: number; onPause: () => void }) {
  return (
    <header className="hud">
      <Hearts lives={lives} max={MAX_LIVES} />
      <p className="hud__score" role="status">
        Score: {score}
      </p>
      <button className="hud__pause" onClick={onPause} aria-label="Pause">
        <span aria-hidden="true">❚❚</span>
      </button>
    </header>
  )
}
