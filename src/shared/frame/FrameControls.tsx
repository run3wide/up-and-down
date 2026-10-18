import { useContext, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FrameContext } from './FrameContext'

interface FrameControlsProps {
  /** Games with sound get a mute button. */
  sound?: { muted: boolean; onToggle: () => void }
  /** Games that can be paused get a pause button. `onPause` must be safe to call more than once. */
  pause?: { paused: boolean; onPause: () => void }
}

/**
 * A game's say in the frame's bar. Rendered anywhere inside the game; the buttons appear in the bar, so every game's
 * mute and pause sit in the same place and look the same.
 */
export function FrameControls({ sound, pause }: FrameControlsProps) {
  const frame = useContext(FrameContext)
  if (!frame) throw new Error('FrameControls must be rendered inside a GameFrame')

  const { paused, onPause } = pause ?? {}
  const { leaving } = frame
  // Cancelling the leave card leaves the game paused, showing its own Resume.
  useEffect(() => {
    if (leaving && paused === false) onPause?.()
  }, [leaving, paused, onPause])

  if (!frame.controlsSlot) return null
  return createPortal(
    <>
      {sound && (
        <button className="game-frame__button" onClick={sound.onToggle} aria-label={sound.muted ? 'Unmute sound' : 'Mute sound'}>
          <span aria-hidden="true">{sound.muted ? '🔇' : '🔊'}</span>
        </button>
      )}
      {pause && (
        <button className="game-frame__button" onClick={pause.onPause} disabled={pause.paused} aria-label="Pause">
          <span aria-hidden="true">❚❚</span>
        </button>
      )}
    </>,
    frame.controlsSlot,
  )
}
