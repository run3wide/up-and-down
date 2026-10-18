import { Hearts } from '../../shared/Hearts'
import { SoundToggle } from '../../shared/SoundToggle'
import { MAX_LIVES } from '../domain/game'

interface HudProps {
  score: number
  lives: number
  muted: boolean
  onToggleSound: () => void
  onPause: () => void
}

export function Hud({ score, lives, muted, onToggleSound, onPause }: HudProps) {
  return (
    <header className="hud">
      <Hearts lives={lives} max={MAX_LIVES} />
      <p className="hud__score" role="status">
        Score: {score}
      </p>
      <div className="hud__actions">
        <SoundToggle muted={muted} onToggle={onToggleSound} />
        <button className="hud__pause" onClick={onPause} aria-label="Pause">
          <span aria-hidden="true">❚❚</span>
        </button>
      </div>
    </header>
  )
}
