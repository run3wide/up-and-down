import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { InMemoryCollectionStore } from './dino-dig/infrastructure/InMemoryCollectionStore'
import { InMemoryGalleryStore } from './colouring/infrastructure/InMemoryGalleryStore'
import { InMemorySketchStore } from './colouring/infrastructure/InMemorySketchStore'
import { InMemoryBestScoreStore } from './shared/InMemoryBestScoreStore'

const bestScores = () => ({
  'up-and-down': new InMemoryBestScoreStore(),
  'lemon-volcano': new InMemoryBestScoreStore(),
  'dino-race': new InMemoryBestScoreStore(),
  'little-chef': new InMemoryBestScoreStore(),
  'match-up': new InMemoryBestScoreStore(),
  'cookie-maze': new InMemoryBestScoreStore(),
  'tic-tac-toe': new InMemoryBestScoreStore(),
  'spelling-bee': new InMemoryBestScoreStore(),
  'dino-dig': new InMemoryBestScoreStore(),
})

const silentSound = { unlock: () => {}, play: () => {} }

function renderApp(path = '/', basePath = '/') {
  window.history.replaceState(null, '', path)
  render(<App random={() => 0.5} bestScores={bestScores()} sound={silentSound} dinoDigCollection={new InMemoryCollectionStore()} colouringGallery={new InMemoryGalleryStore()} colouringSketches={new InMemorySketchStore()} basePath={basePath} />)
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

  it('opens Match Up straight away from its own address', () => {
    renderApp('/match-up')

    expect(screen.getByRole('group', { name: 'Cards' })).toBeInTheDocument()
  })

  it('opens Cookie Maze straight away from its own address', () => {
    renderApp('/cookie-maze')

    expect(screen.getByRole('status')).toHaveTextContent('🍪 left:')
  })

  it('opens Tic Tac Toe straight away from its own address', () => {
    renderApp('/tic-tac-toe')

    expect(screen.getByRole('group', { name: 'Board' })).toBeInTheDocument()
  })

  it('opens Dino Dig straight away from its own address', () => {
    renderApp('/dino-dig')

    expect(screen.getByRole('heading', { name: /^Dig for a/ })).toBeInTheDocument()
  })

  it('opens Colouring straight away from its own address', () => {
    renderApp('/colouring')

    expect(screen.getByRole('group', { name: 'Pictures' })).toBeInTheDocument()
  })

  it('opens Spelling Bee straight away from its own address', () => {
    renderApp('/spelling-bee')

    expect(screen.getByRole('group', { name: 'Alphabet' })).toBeInTheDocument()
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
