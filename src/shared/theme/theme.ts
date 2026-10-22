export type Theme = 'light' | 'dark'

/** Remembers which theme the child picked, on the device. `null` means they never have. */
export interface ThemeStore {
  load(): Theme | null
  save(theme: Theme): void
}

/** A pick the child made wins; otherwise the device's own light or dark setting decides. */
export function chooseTheme(store: ThemeStore, deviceIsDark: boolean): Theme {
  return store.load() ?? (deviceIsDark ? 'dark' : 'light')
}

export const flipped = (theme: Theme): Theme => (theme === 'dark' ? 'light' : 'dark')
