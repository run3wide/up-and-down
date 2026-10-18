import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import type { SoundPlayer } from '../../shared/sound/SoundPlayer'
import { Maze } from '../domain/maze'
import { CELLS_PER_SECOND } from '../domain/mazeGame'
import { MazeScreen } from './MazeScreen'

function renderMaze(...rows: string[]) {
  const bestScores = new InMemoryBestScoreStore()
  const onExit = vi.fn()
  const sound = { unlock: vi.fn(), play: vi.fn() } satisfies SoundPlayer
  const { container } = render(<MazeScreen maze={Maze.fromRows(rows)} bestScores={bestScores} sound={sound} onExit={onExit} />)
  const dinoLeft = () => Number.parseFloat((container.querySelector('.maze__dino') as HTMLElement).style.left)
  return { bestScores, onExit, sound, dinoLeft }
}

function walkFor(cells: number) {
  act(() => {
    vi.advanceTimersByTime((cells / CELLS_PER_SECOND) * 1000)
  })
}

function press(key: string) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }))
    window.dispatchEvent(new KeyboardEvent('keyup', { key }))
  })
}

const cookiesLeft = () => screen.getByRole('status').textContent

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('MazeScreen', () => {
  it('waits at the start, counting the cookies still to find', () => {
    const { dinoLeft } = renderMaze('S...')

    walkFor(3)

    expect(cookiesLeft()).toContain('3')
    expect(dinoLeft()).toBeCloseTo(12.5)
  })

  it('keeps walking after the key is let go, eating cookies on the way', () => {
    const { dinoLeft } = renderMaze('S....')

    press('ArrowRight')
    walkFor(2.2)

    expect(dinoLeft()).toBeCloseTo(50, -1)
    expect(cookiesLeft()).toContain('2')
  })

  it.each([
    ['d', 'right'],
    ['D', 'right'],
    ['ArrowRight', 'right'],
  ])('walks right when %s is pressed', (key) => {
    const { dinoLeft } = renderMaze('S..')

    press(key)
    walkFor(1)

    expect(dinoLeft()).toBeGreaterThan(20)
  })

  it('walks left with A and the left arrow', () => {
    const { dinoLeft } = renderMaze('..S')

    press('a')
    walkFor(1)

    expect(dinoLeft()).toBeLessThan(83)
  })

  it('can be steered with the on-screen arrows', () => {
    const { dinoLeft } = renderMaze('S..')

    fireEvent.click(screen.getByRole('button', { name: 'Go right' }))
    walkFor(1)

    expect(dinoLeft()).toBeGreaterThan(20)
  })

  it('is won when the last cookie is eaten: records the score and goes back to the games', () => {
    const { bestScores, onExit } = renderMaze('S..')

    press('ArrowRight')
    walkFor(3)

    const dialog = screen.getByRole('dialog', { name: 'Every cookie!' })
    expect(within(dialog).getByText(/Score: \d+/)).toBeInTheDocument()
    expect(bestScores.load()).toBeGreaterThan(0)
    fireEvent.click(within(dialog).getByRole('button', { name: 'Back to games' }))
    expect(onExit).toHaveBeenCalledOnce()
  })

  it('roars when the last cookie is eaten, and not before', () => {
    const { sound } = renderMaze('S...')

    press('ArrowRight')
    walkFor(2)
    expect(sound.play).not.toHaveBeenCalled()
    walkFor(2)

    expect(sound.play).toHaveBeenCalledExactlyOnceWith('roar')
  })

  it('is silent while sound is muted', () => {
    const { sound } = renderMaze('S..')

    fireEvent.click(screen.getByRole('button', { name: 'Mute sound' }))
    press('ArrowRight')
    walkFor(3)

    expect(sound.play).not.toHaveBeenCalled()
  })

  it('pauses with Escape and carries on when resumed', () => {
    const { dinoLeft } = renderMaze('S....')
    press('ArrowRight')
    press('Escape')

    walkFor(3)
    expect(dinoLeft()).toBeCloseTo(10)
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }))
    walkFor(1)

    expect(dinoLeft()).toBeCloseTo(30, -1)
  })

  it('goes back to the main menu from the pause screen', () => {
    const { onExit } = renderMaze('S..')

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    fireEvent.click(screen.getByRole('button', { name: 'Main menu' }))

    expect(onExit).toHaveBeenCalledOnce()
  })
})
