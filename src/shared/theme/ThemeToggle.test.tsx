import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { InMemoryThemeStore } from './InMemoryThemeStore'
import { ThemeContext, useThemeController } from './ThemeContext'
import { ThemeToggle } from './ThemeToggle'
import type { ThemeStore } from './theme'

function Harness({ store, deviceIsDark = false }: { store: ThemeStore; deviceIsDark?: boolean }) {
  const controller = useThemeController(store, deviceIsDark)
  return (
    <ThemeContext value={controller}>
      <ThemeToggle />
    </ThemeContext>
  )
}

const pageTheme = () => document.documentElement.dataset.theme

afterEach(() => delete document.documentElement.dataset.theme)

describe('ThemeToggle', () => {
  it('starts light and offers dark mode', () => {
    render(<Harness store={new InMemoryThemeStore()} />)

    expect(pageTheme()).toBe('light')
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument()
  })

  it('starts dark when the device is dark and nothing was picked', () => {
    render(<Harness store={new InMemoryThemeStore()} deviceIsDark />)

    expect(pageTheme()).toBe('dark')
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument()
  })

  it('switches the page and remembers the pick', () => {
    const store = new InMemoryThemeStore()
    render(<Harness store={store} />)

    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))

    expect(pageTheme()).toBe('dark')
    expect(store.load()).toBe('dark')
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(pageTheme()).toBe('light')
    expect(store.load()).toBe('light')
  })

  it('does not save a pick the child never made', () => {
    const store = new InMemoryThemeStore()
    render(<Harness store={store} deviceIsDark />)

    expect(store.load()).toBeNull()
  })

  it('shows nothing where there is no theme to switch', () => {
    render(<ThemeToggle />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
