import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryThemeStore } from './InMemoryThemeStore'
import { LocalStorageThemeStore } from './LocalStorageThemeStore'
import { chooseTheme, flipped } from './theme'

describe('chooseTheme', () => {
  it('uses the theme the child picked last time', () => {
    expect(chooseTheme(new InMemoryThemeStore('dark'), false)).toBe('dark')
    expect(chooseTheme(new InMemoryThemeStore('light'), true)).toBe('light')
  })

  it('follows the device setting when nothing has been picked yet', () => {
    expect(chooseTheme(new InMemoryThemeStore(), true)).toBe('dark')
    expect(chooseTheme(new InMemoryThemeStore(), false)).toBe('light')
  })
})

describe('flipped', () => {
  it('swaps light and dark', () => {
    expect(flipped('light')).toBe('dark')
    expect(flipped('dark')).toBe('light')
  })
})

describe('LocalStorageThemeStore', () => {
  beforeEach(() => localStorage.clear())

  it('remembers the pick between visits', () => {
    new LocalStorageThemeStore('theme').save('dark')

    expect(new LocalStorageThemeStore('theme').load()).toBe('dark')
  })

  it('has no pick to start with, and ignores junk', () => {
    expect(new LocalStorageThemeStore('theme').load()).toBeNull()
    localStorage.setItem('theme', 'purple')
    expect(new LocalStorageThemeStore('theme').load()).toBeNull()
  })

  it('carries on when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const store = new LocalStorageThemeStore('theme')

    expect(store.load()).toBeNull()
    expect(() => store.save('dark')).not.toThrow()
    vi.restoreAllMocks()
  })
})
