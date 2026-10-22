import type { Theme, ThemeStore } from './theme'

export class InMemoryThemeStore implements ThemeStore {
  private theme: Theme | null

  constructor(theme: Theme | null = null) {
    this.theme = theme
  }

  load(): Theme | null {
    return this.theme
  }

  save(theme: Theme): void {
    this.theme = theme
  }
}
