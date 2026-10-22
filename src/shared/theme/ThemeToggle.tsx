import { use } from 'react'
import { ThemeContext } from './ThemeContext'
import './theme.css'

/** A moon (to go dark) or sun (to go light) button, the same on the picker and in every game's bar. */
export function ThemeToggle() {
  const controller = use(ThemeContext)
  if (!controller) return null
  const goingDark = controller.theme === 'light'
  return (
    <button className="theme-toggle" aria-label={goingDark ? 'Switch to dark mode' : 'Switch to light mode'} onClick={controller.toggle}>
      <span aria-hidden="true">{goingDark ? '🌙' : '☀️'}</span>
    </button>
  )
}
