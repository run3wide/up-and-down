import './frame.css'

import { useState } from 'react'
import { Overlay } from '../Overlays'
import { FrameContext } from './FrameContext'

interface GameFrameProps {
  title: string
  onHome: () => void
  children: React.ReactNode
}

/** The same bar around every game: Home on the left, the game's name, then whatever the game plugs in (mute, pause). */
export function GameFrame({ title, onHome, children }: GameFrameProps) {
  const [controlsSlot, setControlsSlot] = useState<HTMLElement | null>(null)
  const [leaving, setLeaving] = useState(false)

  return (
    <FrameContext value={{ controlsSlot, leaving }}>
      <div className="game-frame">
        <header className="game-frame__bar">
          <button className="game-frame__button" onClick={() => setLeaving(true)} aria-label="Home">
            <span aria-hidden="true">🏠</span>
          </button>
          <p className="game-frame__title">{title}</p>
          <div className="game-frame__controls" ref={setControlsSlot} />
        </header>
        <div className="game-frame__content">{children}</div>
        {leaving && (
          <Overlay title="Leave game?">
            <button className="big-button" autoFocus onClick={() => setLeaving(false)}>
              Keep playing
            </button>
            <button className="big-button big-button--quiet" onClick={onHome}>
              Yes, go home
            </button>
          </Overlay>
        )}
      </div>
    </FrameContext>
  )
}
