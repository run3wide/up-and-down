import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import { DIFFICULTIES, LEVELS, type Difficulty } from '../domain/words'
import { SpellingScreen } from './SpellingScreen'
import { inFrame } from '../../test-support/inFrame'

/** With every random value at 0 the first word is the first of the shortest: CAT. */
const alwaysFirstWord = () => 0

function renderSpelling(bestScore = 0, level: Difficulty = 'easy') {
  const allBestScores = Object.fromEntries(DIFFICULTIES.map((difficulty) => [difficulty, new InMemoryBestScoreStore(difficulty === level ? bestScore : 0)])) as Record<Difficulty, InMemoryBestScoreStore>
  const onExit = vi.fn()
  const sound = { unlock: vi.fn(), play: vi.fn() }
  render(inFrame(<SpellingScreen random={alwaysFirstWord} bestScores={allBestScores} sound={sound} onExit={onExit} />))
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${level}`, 'i') }))
  return { bestScores: allBestScores[level], allBestScores, onExit, sound }
}

const alphabet = () => within(screen.getByRole('group', { name: 'Alphabet' }))
const letter = (name: string) => alphabet().getByRole('button', { name })
const blanks = () => within(screen.getByRole('group', { name: 'Word' })).getAllByRole('button')
/** The dinosaur is DINO on easy and DINOSAUR on hard, so the picture is told apart by how many blanks it has. */
const currentWord = () => Object.values(LEVELS).flat().find((word) => word.emoji === screen.getByRole('img', { name: /^Picture/ }).textContent && word.spelling.length === blanks().length)!

function tapLetterThenBlank(name: string, position: number) {
  fireEvent.click(letter(name))
  fireEvent.click(blanks()[position])
}

function spellCurrentWord() {
  ;[...currentWord().spelling].forEach((name, position) => tapLetterThenBlank(name, position))
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('SpellingScreen', () => {
  it('shows a picture with a blank for each letter and the whole alphabet to choose from', () => {
    renderSpelling()

    expect(screen.getByRole('img', { name: /^Picture/ })).toHaveTextContent('🐱')
    expect(blanks()).toHaveLength(3)
    expect(alphabet().getAllByRole('button').map((button) => button.textContent).join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
  })

  it('keeps a right letter in its blank', () => {
    renderSpelling()

    tapLetterThenBlank('C', 0)

    expect(blanks()[0]).toHaveAccessibleName('Letter 1: C')
    expect(screen.queryByText(/Nuh-uh/)).not.toBeInTheDocument()
  })

  it('does a nuh-uh and sends a wrong letter back', () => {
    renderSpelling()

    tapLetterThenBlank('D', 0)

    expect(screen.getByRole('alert')).toHaveTextContent('Nuh-uh')
    expect(blanks()[0]).toHaveAccessibleName('Blank 1')
    expect(blanks()[0]).toHaveClass('speller__blank--nuh-uh')

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(blanks()[0]).not.toHaveClass('speller__blank--nuh-uh')
  })

  it('lets a letter be used again for another blank', () => {
    renderSpelling()
    tapLetterThenBlank('C', 0)

    expect(letter('C')).toBeEnabled()
  })

  it('places a letter dragged onto a blank', () => {
    renderSpelling()
    const target = blanks()[0]
    document.elementFromPoint = () => target

    fireEvent.pointerDown(letter('C'), { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 80, clientY: 90, pointerId: 1 })
    fireEvent.pointerUp(window, { clientX: 80, clientY: 90, pointerId: 1 })

    expect(blanks()[0]).toHaveAccessibleName('Letter 1: C')
  })

  it('sends a letter dropped on the wrong blank back with a nuh-uh', () => {
    renderSpelling()
    const target = blanks()[0]
    document.elementFromPoint = () => target

    fireEvent.pointerDown(letter('T'), { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 80, clientY: 90, pointerId: 1 })
    fireEvent.pointerUp(window, { clientX: 80, clientY: 90, pointerId: 1 })

    expect(blanks()[0]).toHaveAccessibleName('Blank 1')
    expect(screen.getByRole('alert')).toHaveTextContent('Nuh-uh')
  })

  it('drops a dragged letter back in the tray when it is let go of anywhere else', () => {
    renderSpelling()
    document.elementFromPoint = () => document.body

    fireEvent.pointerDown(letter('C'), { clientX: 10, clientY: 10, pointerId: 1 })
    fireEvent.pointerMove(window, { clientX: 80, clientY: 90, pointerId: 1 })
    fireEvent.pointerUp(window, { clientX: 80, clientY: 90, pointerId: 1 })

    expect(blanks()[0]).toHaveAccessibleName('Blank 1')
    expect(screen.queryByText(/Nuh-uh/)).not.toBeInTheDocument()
  })

  it('fills the next empty blank from typed letters, so the keyboard works too', () => {
    renderSpelling()

    fireEvent.keyDown(window, { key: 'c' })
    fireEvent.keyDown(window, { key: 'x' })

    expect(blanks()[0]).toHaveAccessibleName('Letter 1: C')
    expect(blanks()[1]).toHaveAccessibleName('Blank 2')
    expect(screen.getByRole('alert')).toHaveTextContent('Nuh-uh')
  })

  it('celebrates a spelled word, scores it and waits for the next word', () => {
    const { bestScores } = renderSpelling()

    spellCurrentWord()

    expect(screen.getByRole('alert')).toHaveTextContent('You spelled CAT!')
    expect(screen.getByRole('status')).toHaveTextContent('Score: 1')
    expect(bestScores.load()).toBe(1)
    expect(letter('A')).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Next word' }))

    expect(blanks().length).toBeGreaterThan(0)
    expect(screen.getByRole('img', { name: /^Picture/ })).not.toHaveTextContent('🐱')
    expect(screen.queryByRole('button', { name: 'Next word' })).not.toBeInTheDocument()
    expect(letter('A')).toBeEnabled()
  })

  it('makes the animal sound when its word is spelled', () => {
    const { sound } = renderSpelling()

    tapLetterThenBlank('C', 0)
    tapLetterThenBlank('A', 1)
    expect(sound.play).not.toHaveBeenCalled()
    tapLetterThenBlank('T', 2)

    expect(sound.unlock).toHaveBeenCalled()
    expect(sound.play).toHaveBeenCalledExactlyOnceWith('meow')
  })

  it('stays quiet when muted', () => {
    const { sound } = renderSpelling()

    fireEvent.click(screen.getByRole('button', { name: 'Mute sound' }))
    spellCurrentWord()

    expect(sound.play).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Unmute sound' })).toBeInTheDocument()
  })

  it('pauses and goes back to the games', () => {
    const { onExit } = renderSpelling()

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    fireEvent.click(screen.getByRole('button', { name: 'Main menu' }))

    expect(onExit).toHaveBeenCalled()
  })

  it('asks which level to play before any picture appears', () => {
    const allBestScores = Object.fromEntries(DIFFICULTIES.map((difficulty) => [difficulty, new InMemoryBestScoreStore()])) as Record<Difficulty, InMemoryBestScoreStore>
    render(inFrame(<SpellingScreen random={alwaysFirstWord} bestScores={allBestScores} sound={{ unlock: vi.fn(), play: vi.fn() }} onExit={vi.fn()} />))

    const levels = within(screen.getByRole('group', { name: 'Levels' })).getAllByRole('button')

    expect(levels.map((level) => level.textContent)).toEqual([expect.stringMatching(/Easy.*CAT/), expect.stringMatching(/Medium.*BANANA/), expect.stringMatching(/Hard.*WATERMELON/)])
    expect(screen.queryByRole('img', { name: /^Picture/ })).not.toBeInTheDocument()
  })

  it('plays medium with six and seven letter words', () => {
    renderSpelling(0, 'medium')

    expect(blanks().length).toBeGreaterThanOrEqual(6)
    expect(blanks().length).toBeLessThanOrEqual(7)
  })

  it('spells a ten letter word on hard, and keeps the score for that level alone', () => {
    const { allBestScores } = renderSpelling(0, 'hard')
    while (blanks().length < 10) {
      spellCurrentWord()
      fireEvent.click(screen.getByRole('button', { name: 'Next word' }))
    }

    spellCurrentWord()

    expect(screen.getByRole('alert')).toHaveTextContent(/WATERMELON|STRAWBERRY|HELICOPTER/)
    expect(allBestScores.hard.load()).toBeGreaterThan(0)
    expect(allBestScores.easy.load()).toBe(0)
    expect(allBestScores.medium.load()).toBe(0)
  })
})
