import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import type { SoundPlayer } from '../../shared/sound/SoundPlayer'
import { Maze } from '../domain/maze'
import { MAX_LIVES, STAR_BONUS_SECONDS } from '../domain/mazeGame'
import type { MazeLevel } from '../domain/mazeRun'
import { MazeScreen } from './MazeScreen'

const CLOCK = 120

function level(rows: string[], timeLimit = CLOCK): MazeLevel {
  return { maze: Maze.fromRows(rows), timeLimit }
}

function renderMaze(rows: string[], timeLimit?: number, ...laterMazes: MazeLevel[]) {
  const bestScores = new InMemoryBestScoreStore()
  const onExit = vi.fn()
  const sound = { unlock: vi.fn(), play: vi.fn() } satisfies SoundPlayer
  const { container } = render(
    <MazeScreen levels={[level(rows, timeLimit), ...laterMazes]} bestScores={bestScores} sound={sound} onExit={onExit} />,
  )
  const dinoLeft = () => Number.parseFloat((container.querySelector('.maze__dino') as HTMLElement).style.left)
  return { bestScores, onExit, sound, container, dinoLeft }
}

function wait(seconds: number) {
  act(() => {
    vi.advanceTimersByTime(seconds * 1000)
  })
}

function press(key: string) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }))
    window.dispatchEvent(new KeyboardEvent('keyup', { key }))
  })
}

const cookiesLeft = () => screen.getByRole('status').textContent
const timeLeft = () => screen.getByRole('timer').textContent

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('MazeScreen', () => {
  it('waits at the start, showing the cookies to find, the clock and three lives', () => {
    const { dinoLeft } = renderMaze(['S...'])

    wait(5)

    expect(cookiesLeft()).toContain('3')
    expect(timeLeft()).toContain(String(CLOCK))
    expect(screen.getByLabelText(`${MAX_LIVES} lives left`)).toBeInTheDocument()
    expect(dinoLeft()).toBeCloseTo(12.5)
  })

  it('moves one cell for each press and stays there', () => {
    const { dinoLeft } = renderMaze(['S....'])

    press('ArrowRight')
    wait(1)

    expect(dinoLeft()).toBeCloseTo(30)
    expect(cookiesLeft()).toContain('3')
  })

  it.each(['d', 'D', 'ArrowRight'])('steps right when %s is pressed', (key) => {
    const { dinoLeft } = renderMaze(['S..'])

    press(key)

    expect(dinoLeft()).toBeCloseTo(50)
  })

  it.each(['a', 'ArrowLeft'])('steps left when %s is pressed', (key) => {
    const { dinoLeft } = renderMaze(['..S'])

    press(key)

    expect(dinoLeft()).toBeCloseTo(50)
  })

  it('steps with the on-screen arrows', () => {
    const { dinoLeft } = renderMaze(['S..'])

    fireEvent.click(screen.getByRole('button', { name: 'Go right' }))

    expect(dinoLeft()).toBeCloseTo(50)
  })

  it('counts the clock down once the dino has set off', () => {
    renderMaze(['S...'])

    press('ArrowRight')
    wait(10.5)

    expect(timeLeft()).toContain(String(CLOCK - 10))
  })

  it('is won when the last cookie is eaten: records the score and goes back to the games', () => {
    const { bestScores, onExit } = renderMaze(['S..'])

    press('ArrowRight')
    press('ArrowRight')

    const dialog = screen.getByRole('dialog', { name: 'All mazes cleared!' })
    expect(within(dialog).getByText(/Score: \d+/)).toBeInTheDocument()
    expect(bestScores.load()).toBeGreaterThan(0)
    fireEvent.click(within(dialog).getByRole('button', { name: 'Back to games' }))
    expect(onExit).toHaveBeenCalledOnce()
  })

  it('does the victory roar when the last cookie is eaten, and not before', () => {
    const { sound } = renderMaze(['S...'])

    press('ArrowRight')
    press('ArrowRight')
    expect(sound.play).not.toHaveBeenCalled()
    press('ArrowRight')

    expect(sound.play).toHaveBeenCalledExactlyOnceWith('victoryRoar')
  })

  it('is silent while sound is muted', () => {
    const { sound } = renderMaze(['S..'])

    fireEvent.click(screen.getByRole('button', { name: 'Mute sound' }))
    press('ArrowRight')
    press('ArrowRight')

    expect(sound.play).not.toHaveBeenCalled()
  })

  it('says better luck next time when time runs out, then starts the maze again with a life fewer', () => {
    const { dinoLeft } = renderMaze(['S....'], 2)
    press('ArrowRight')

    wait(3)

    const dialog = screen.getByRole('dialog', { name: "Time's up!" })
    expect(within(dialog).getByText(/better luck next time/i)).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Try again' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByLabelText(`${MAX_LIVES - 1} lives left`)).toBeInTheDocument()
    expect(cookiesLeft()).toContain('4')
    expect(dinoLeft()).toBeCloseTo(10)
  })

  it('goes back to the games after the last try, with a kind word and the score', () => {
    const { bestScores, onExit } = renderMaze(['S....'], 2)

    for (let attempt = 1; attempt < MAX_LIVES; attempt++) {
      press('ArrowRight')
      wait(3)
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    }
    press('ArrowRight')
    wait(3)

    const dialog = screen.getByRole('dialog', { name: "Time's up!" })
    expect(within(dialog).getByText(/better luck next time/i)).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
    expect(bestScores.load()).toBe(10)
    fireEvent.click(within(dialog).getByRole('button', { name: 'Back to games' }))
    expect(onExit).toHaveBeenCalledOnce()
  })

  it('says which maze it is', () => {
    renderMaze(['S..'], undefined, level(['S.']))

    expect(screen.getByText('Maze 1 of 2')).toBeInTheDocument()
  })

  it('shows a super star, and sets off fireworks that clear the cookies around it', () => {
    const { container } = renderMaze(['S*....'])
    expect(container.querySelector('.maze__star')).toBeInTheDocument()
    expect(container.querySelector('.maze__burst')).not.toBeInTheDocument()

    press('ArrowRight')

    expect(container.querySelector('.maze__burst')).toBeInTheDocument()
    expect(container.querySelector('.maze__star')).not.toBeInTheDocument()
    expect(cookiesLeft()).toContain('2')
    expect(screen.getByText(`+${STAR_BONUS_SECONDS}s`)).toBeInTheDocument()
  })

  it('clears the fireworks away again after a moment', () => {
    const { container } = renderMaze(['S*.......'])
    press('ArrowRight')

    wait(2)

    expect(container.querySelector('.maze__burst')).not.toBeInTheDocument()
  })

  it('moves on to the next maze when one is cleared, then finishes after the last', () => {
    const { bestScores, onExit } = renderMaze(['S.'], undefined, level(['S.']))

    press('ArrowRight')
    const cleared = screen.getByRole('dialog', { name: 'Maze cleared!' })
    expect(bestScores.load()).toBe(0)
    fireEvent.click(within(cleared).getByRole('button', { name: 'Next maze' }))

    expect(screen.getByText('Maze 2 of 2')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    press('ArrowRight')
    const finished = screen.getByRole('dialog', { name: 'All mazes cleared!' })
    expect(bestScores.load()).toBeGreaterThan(2 * 10)
    fireEvent.click(within(finished).getByRole('button', { name: 'Back to games' }))
    expect(onExit).toHaveBeenCalledOnce()
  })

  it('pauses with Escape, stopping the clock, and carries on when resumed', () => {
    renderMaze(['S...'])
    press('ArrowRight')
    press('Escape')

    wait(10.5)
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }))

    expect(timeLeft()).toContain(String(CLOCK))
  })

  it('goes back to the main menu from the pause screen', () => {
    const { onExit } = renderMaze(['S..'])

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    fireEvent.click(screen.getByRole('button', { name: 'Main menu' }))

    expect(onExit).toHaveBeenCalledOnce()
  })
})
