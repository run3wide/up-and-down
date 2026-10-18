import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import type { SoundPlayer } from '../../shared/sound/SoundPlayer'
import { GameScreen } from './GameScreen'
import { inFrame } from '../../test-support/inFrame'

const middle = () => 0.5

function renderGame(bestScore = 0) {
  const bestScores = new InMemoryBestScoreStore(bestScore)
  const onExit = vi.fn()
  const sound = { unlock: vi.fn(), play: vi.fn() } satisfies SoundPlayer
  render(inFrame(<GameScreen random={middle} bestScores={bestScores} sound={sound} onExit={onExit} />))
  return { bestScores, onExit, sound }
}

function playFor(seconds: number) {
  act(() => {
    vi.advanceTimersByTime(seconds * 1000)
  })
}

function keyDown(key: string) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }))
  })
}

function keyUp(key: string) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keyup', { key }))
  })
}

function loseAllLivesByHidingFromTheBall() {
  keyDown('ArrowLeft')
  playFor(15)
  keyUp('ArrowLeft')
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('GameScreen', () => {
  it('starts with a score of zero and three lives', () => {
    renderGame()

    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
    expect(screen.getByLabelText('3 lives left')).toBeInTheDocument()
  })

  it('announces and shows the score when the dinosaur catches the ball', () => {
    renderGame()

    playFor(4)

    expect(screen.getByRole('status')).toHaveTextContent('Score: 1')
  })

  it('roars when the dinosaur catches the ball', () => {
    const { sound } = renderGame()

    playFor(4)

    expect(sound.play).toHaveBeenCalledWith('roar')
  })

  it('stays quiet when the ball is missed', () => {
    const { sound } = renderGame()

    loseAllLivesByHidingFromTheBall()

    expect(sound.play).not.toHaveBeenCalled()
  })

  it('is silent while sound is muted, and roars again once unmuted', () => {
    const { sound } = renderGame()

    fireEvent.click(screen.getByRole('button', { name: 'Mute sound' }))
    playFor(4)
    expect(sound.play).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Unmute sound' }))
    playFor(4)
    expect(sound.play).toHaveBeenCalledWith('roar')
  })

  it('pauses with Escape and resumes with the Resume button', () => {
    renderGame()

    keyDown('Escape')
    const pause = screen.getByRole('dialog', { name: 'Paused' })
    fireEvent.click(within(pause).getByRole('button', { name: 'Resume' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('can go back to the games menu from the pause dialog', () => {
    const { onExit } = renderGame()

    keyDown('Escape')
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Paused' })).getByRole('button', { name: 'Main menu' }))

    expect(onExit).toHaveBeenCalledOnce()
  })

  it('pauses and resumes with the space bar', () => {
    renderGame()

    keyDown(' ')
    expect(screen.getByRole('dialog', { name: 'Paused' })).toBeInTheDocument()
    keyDown(' ')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('freezes the score while paused', () => {
    renderGame()
    keyDown('Escape')

    playFor(10)

    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
  })

  it('shows game over with the score and best score after the last life is lost', () => {
    renderGame(7)

    loseAllLivesByHidingFromTheBall()

    const gameOver = screen.getByRole('dialog', { name: 'Game over' })
    expect(within(gameOver).getByText('Score: 0')).toBeInTheDocument()
    expect(within(gameOver).getByText('Best: 7')).toBeInTheDocument()
  })

  it('saves a new best score', () => {
    const { bestScores } = renderGame()
    playFor(7)
    loseAllLivesByHidingFromTheBall()

    expect(bestScores.load()).toBeGreaterThan(0)
  })

  it('goes back to the games menu when the round is over and Back to games is pressed', () => {
    const { onExit } = renderGame()
    loseAllLivesByHidingFromTheBall()

    fireEvent.click(screen.getByRole('button', { name: 'Back to games' }))

    expect(onExit).toHaveBeenCalledOnce()
  })

  it('has on-screen buttons for touch players', () => {
    renderGame()

    expect(screen.getByRole('button', { name: 'Move left' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Move right' })).toBeInTheDocument()
  })
})
