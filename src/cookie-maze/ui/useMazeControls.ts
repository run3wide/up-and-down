import { useEffect, useRef } from 'react'
import type { Direction } from '../domain/maze'

interface Controls {
  steer(direction: Direction): void
  togglePause(): void
}

const DIRECTION_KEYS: Record<string, Direction> = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
}
const PAUSE_KEYS = new Set(['Escape', ' ', 'p', 'P'])

export function useMazeControls(controls: Controls): void {
  const latest = useRef(controls)
  useEffect(() => {
    latest.current = controls
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = DIRECTION_KEYS[event.key]
      if (direction) {
        event.preventDefault()
        latest.current.steer(direction)
      } else if (PAUSE_KEYS.has(event.key) && !event.repeat && !isActivatingButton(event)) {
        event.preventDefault()
        latest.current.togglePause()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

/** Space on a focused button should press that button, not toggle pause as well. */
function isActivatingButton(event: KeyboardEvent): boolean {
  return event.key === ' ' && event.target instanceof HTMLButtonElement
}
