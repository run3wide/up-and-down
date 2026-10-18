import { useEffect, useRef } from 'react'
import type { AimDirection } from '../domain/hoopsGame'

interface Controls {
  hold(direction: AimDirection): void
  release(direction: AimDirection): void
  shoot(): void
  togglePause(): void
}

const DIRECTION_KEYS: Record<string, AimDirection> = {
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
}
const PAUSE_KEYS = new Set(['Escape', 'p', 'P'])

export function useHoopsControls(controls: Controls): void {
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
      } else if (event.key === ' ' && !isPressingButton(event)) {
        event.preventDefault()
        if (!event.repeat) latest.current.shoot()
      } else if (PAUSE_KEYS.has(event.key) && !event.repeat) {
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

/** Space on a focused button (Resume, Back to games) should press that button, not shoot. */
function isPressingButton(event: KeyboardEvent): boolean {
  return event.target instanceof HTMLButtonElement
}
