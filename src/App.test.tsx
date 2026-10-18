import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { InMemoryBestScoreStore } from './shared/InMemoryBestScoreStore'

const bestScores = () => ({
  'up-and-down': new InMemoryBestScoreStore(),
  'lemon-volcano': new InMemoryBestScoreStore(),
  'dino-race': new InMemoryBestScoreStore(),
  'little-chef': new InMemoryBestScoreStore(),
})

const silentSound = { unlock: () => {}, play: () => {} }

function renderApp(path = '/', basePath = '/') {
  window.history.replaceState(null, '', path)
  render(<App random={() => 0.5} bestScores={bestScores()} sound={silentSound} basePath={basePath} />)
}

function keyDown(key: string) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }))
  })
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
})

const pickerHeading = () => screen.getByRole('heading', { name: 'Pick a game' })

describe('App', () => {
  it('opens on the game picker', () => {
    renderApp('/')

    expect(pickerHeading()).toBeInTheDocument()
  })

  it('opens a game straight away from its own address', () => {
    renderApp('/lemon-volcano')

    expect(screen.getByLabelText('8 lemons left')).toBeInTheDocument()
  })

  it('opens Dino Race straight away from its own address', () => {
    renderApp('/dino-race')

    expect(screen.getByRole('progressbar', { name: 'Race progress' })).toBeInTheDocument()
  })

  it('opens Little Chef straight away from its own address', () => {
    renderApp('/little-chef')

    expect(screen.getByRole('group', { name: 'Ingredients' })).toBeInTheDocument()
  })

  it('opens the other game from its address, under a base path', () => {
    renderApp('/up-and-down/up-and-down', '/up-and-down/')

    expect(screen.getByLabelText('3 lives left')).toBeInTheDocument()
  })

  it('gives each game its own address when picked from the menu', () => {
    renderApp('/')

    fireEvent.click(screen.getByRole('button', { name: /Lemon Volcano/ }))

    expect(window.location.pathname).toBe('/lemon-volcano')
  })

  it('follows the browser back button to the picker', () => {
    renderApp('/')
    fireEvent.click(screen.getByRole('button', { name: /Up and Down/ }))

    act(() => {
      window.history.replaceState(null, '', '/')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(pickerHeading()).toBeInTheDocument()
  })

  it('plays a round of Lemon Volcano and returns to the picker address', () => {
    renderApp('/lemon-volcano')

    for (let throwNumber = 0; throwNumber < 8; throwNumber++) {
      keyDown(' ')
      act(() => {
        vi.advanceTimersByTime(3000)
      })
    }
    fireEvent.click(screen.getByRole('button', { name: 'Back to games' }))

    expect(pickerHeading()).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('plays a round of Up and Down and returns to the picker', () => {
    renderApp('/up-and-down')
    keyDown('ArrowLeft')

    act(() => {
      vi.advanceTimersByTime(15000)
    })
    fireEvent.click(screen.getByRole('button', { name: 'Back to games' }))

    expect(pickerHeading()).toBeInTheDocument()
  })
})
