import { Hearts } from '../../shared/Hearts'
import { MAX_LIVES } from '../domain/game'

interface HudProps {
  score: number
  lives: number
}

export function Hud({ score, lives }: HudProps) {
  return (
    <header className="hud">
      <Hearts lives={lives} max={MAX_LIVES} />
      <p className="hud__score" role="status">
        Score: {score}
      </p>
    </header>
  )
}
