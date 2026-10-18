import { useEffect, useRef } from 'react'
import type { SteerDirection } from '../domain/raceGame'

interface Controls {
  hold(direction: SteerDirection): void
  release(direction: SteerDirection): void
  togglePause(): void
}

const DIRECTION_KEYS: Record<string, SteerDirection> = {
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
}
const PAUSE_KEYS = new Set(['Escape', ' ', 'p', 'P'])

export function useRaceControls(controls: Controls): void {
  const latest = useRef(controls)
  useEffect(() => {
    latest.current = controls
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = DIRECTION_KEYS[event.key]
      if (direction) {
        event.preventDefault()
        latest.current.hold(direction)
      } else if (PAUSE_KEYS.has(event.key) && !event.repeat && !isActivatingButton(event)) {
        event.preventDefault()
        latest.current.togglePause()
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      const direction = DIRECTION_KEYS[event.key]
      if (direction) latest.current.release(direction)
    }
    const releaseAll = () => {
      latest.current.release('left')
      latest.current.release('right')
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', releaseAll)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', releaseAll)
    }
  }, [])
}

/** Space on a focused button should press that button, not toggle pause as well. */
function isActivatingButton(event: KeyboardEvent): boolean {
  return event.key === ' ' && event.target instanceof HTMLButtonElement
}
