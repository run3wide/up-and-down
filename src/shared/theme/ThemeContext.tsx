import { createContext, useCallback, useEffect, useState } from 'react'
import { chooseTheme, flipped, type Theme, type ThemeStore } from './theme'

export interface ThemeController {
  readonly theme: Theme
  readonly toggle: () => void
}

/** Null where no theme is wired up (tests of single screens), so the toggle simply isn't there. */
export const ThemeContext = createContext<ThemeController | null>(null)

/** Keeps the page's `data-theme` in step with the theme, which the stylesheets read. */
export function useThemeController(store: ThemeStore, deviceIsDark: boolean): ThemeController {
  const [theme, setTheme] = useState(() => chooseTheme(store, deviceIsDark))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggle = useCallback(() => {
    const next = flipped(theme)
    store.save(next)
    setTheme(next)
  }, [store, theme])

  return { theme, toggle }
}
