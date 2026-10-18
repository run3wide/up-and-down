import { useEffect, useRef } from 'react'

/** Calls `onFrame` with the seconds elapsed since the previous frame while `active`. */
export function useAnimationFrame(onFrame: (elapsedSeconds: number) => void, active: boolean): void {
  const latest = useRef(onFrame)
  useEffect(() => {
    latest.current = onFrame
  })

  useEffect(() => {
    if (!active) return
    let previous: number | null = null
    let handle = requestAnimationFrame(function frame(now) {
      latest.current(previous === null ? 0 : (now - previous) / 1000)
      previous = now
      handle = requestAnimationFrame(frame)
    })
    return () => cancelAnimationFrame(handle)
  }, [active])
}
