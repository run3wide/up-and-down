import type { ReactElement } from 'react'
import { GameFrame } from '../shared/frame/GameFrame'

/** A game screen inside the frame it always has in the app, so its pause and mute buttons are in the bar. */
export const inFrame = (game: ReactElement, onHome: () => void = () => {}) => (
  <GameFrame title="Test game" onHome={onHome}>
    {game}
  </GameFrame>
)
