import type { Theme, ThemeStore } from './theme'

/** Storage can be blocked (private windows, strict settings); the app must still work. */
export class LocalStorageThemeStore implements ThemeStore {
  private readonly key: string

  constructor(key: string) {
    this.key = key
  }

  load(): Theme | null {
    try {
      const stored = localStorage.getItem(this.key)
      return stored === 'light' || stored === 'dark' ? stored : null
    } catch {
      return null
    }
  }

  save(theme: Theme): void {
    try {
      localStorage.setItem(this.key, theme)
    } catch {
      // The pick just won't persist.
    }
  }
}
