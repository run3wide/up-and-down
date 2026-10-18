import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { InMemoryBestScoreStore } from './shared/InMemoryBestScoreStore'

const bestScores = () => ({
  'up-and-down': new InMemoryBestScoreStore(),
  'robot-hoops': new InMemoryBestScoreStore(),
})

function renderApp() {
  render(<App random={() => 0.5} bestScores={bestScores()} />)
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

describe('App', () => {
  it('opens on the game picker', () => {
    renderApp()

    expect(screen.getByRole('heading', { name: 'Pick a game' })).toBeInTheDocument()
  })

  it('plays a round of Robot Hoops and returns to the picker', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: /Robot Hoops/ }))

    for (let shot = 0; shot < 8; shot++) {
      keyDown(' ')
      act(() => {
        vi.advanceTimersByTime(3000)
      })
    }
    fireEvent.click(screen.getByRole('button', { name: 'Back to games' }))

    expect(screen.getByRole('heading', { name: 'Pick a game' })).toBeInTheDocument()
  })

  it('plays a round of Up and Down and returns to the picker', () => {
    renderApp()
    fireEvent.click(screen.getByRole('button', { name: /Up and Down/ }))
    keyDown('ArrowLeft')

    act(() => {
      vi.advanceTimersByTime(15000)
    })
    fireEvent.click(screen.getByRole('button', { name: 'Back to games' }))

    expect(screen.getByRole('heading', { name: 'Pick a game' })).toBeInTheDocument()
  })
})
