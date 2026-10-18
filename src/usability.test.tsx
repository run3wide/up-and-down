import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { App } from './App'
import { InMemoryGalleryStore } from './colouring/infrastructure/InMemoryGalleryStore'
import { InMemorySketchStore } from './colouring/infrastructure/InMemorySketchStore'
import { InMemoryCollectionStore } from './dino-dig/infrastructure/InMemoryCollectionStore'
import { InMemoryBestScoreStore } from './shared/InMemoryBestScoreStore'
import type { SoundPlayer } from './shared/sound/SoundPlayer'
import type { GameId } from './splash/games'
import { loadStyles } from './test-support/loadStyles'

/**
 * What a child does first: open the picker, tap a game's card, find their way around, and get back out. One case per
 * game, and `Record<GameId, …>` means a new game cannot be added without adding it here.
 */
interface Usability {
  /** The card's accessible name, as a pattern. */
  card: RegExp
  /** Something only this game's screen has. */
  onScreen: () => HTMLElement
  stylesheet: string
  /** Turn-based screens are taller than a small screen can be, so they must scroll; action games fit a fixed stage. */
  layout: 'scrolls' | 'fixed-stage'
}

const GAMES: Record<GameId, Usability> = {
  'up-and-down': { card: /^Play Up and Down/, onScreen: () => screen.getByLabelText('3 lives left'), stylesheet: 'up-and-down/ui/game.css', layout: 'fixed-stage' },
  'lemon-volcano': { card: /^Play Lemon Volcano/, onScreen: () => screen.getByLabelText('8 lemons left'), stylesheet: 'lemon-volcano/ui/volcano.css', layout: 'fixed-stage' },
  'dino-race': { card: /^Play Dino Race/, onScreen: () => screen.getByRole('progressbar', { name: 'Race progress' }), stylesheet: 'dino-race/ui/race.css', layout: 'fixed-stage' },
  'little-chef': { card: /^Play Little Chef/, onScreen: () => screen.getByRole('group', { name: 'Ingredients' }), stylesheet: 'little-chef/ui/kitchen.css', layout: 'scrolls' },
  'match-up': { card: /^Play Match Up/, onScreen: () => screen.getByRole('group', { name: 'Cards' }), stylesheet: 'match-up/ui/match.css', layout: 'scrolls' },
  'cookie-maze': { card: /^Play Cookie Maze/, onScreen: () => screen.getByRole('status'), stylesheet: 'cookie-maze/ui/maze.css', layout: 'fixed-stage' },
  'tic-tac-toe': { card: /^Play Tic Tac Toe/, onScreen: () => screen.getByRole('group', { name: 'Board' }), stylesheet: 'tic-tac-toe/ui/ticTacToe.css', layout: 'scrolls' },
  'spelling-bee': { card: /^Play Spelling Bee/, onScreen: () => screen.getByRole('group', { name: 'Alphabet' }), stylesheet: 'spelling-bee/ui/spelling.css', layout: 'scrolls' },
  'dino-dig': { card: /^Play Dino Dig/, onScreen: () => screen.getByRole('group', { name: 'Dig site' }), stylesheet: 'dino-dig/ui/dig.css', layout: 'scrolls' },
  'brick-builder': { card: /^Play Brick Builder/, onScreen: () => screen.getByRole('group', { name: 'Baseplate' }), stylesheet: 'brick-builder/ui/builder.css', layout: 'scrolls' },
  colouring: { card: /^Play Colouring/, onScreen: () => screen.getByRole('group', { name: 'Pictures' }), stylesheet: 'colouring/ui/colouring.css', layout: 'scrolls' },
}

const bestScores = () => Object.fromEntries(Object.keys(GAMES).map((game) => [game, new InMemoryBestScoreStore()])) as Record<GameId, InMemoryBestScoreStore>

let sound: { unlock: Mock<SoundPlayer['unlock']>; play: Mock<SoundPlayer['play']> }
let removeStyles: () => void

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
  window.history.replaceState(null, '', '/')
  sound = { unlock: vi.fn<SoundPlayer['unlock']>(), play: vi.fn<SoundPlayer['play']>() }
  render(<App random={() => 0.5} bestScores={bestScores()} sound={sound} dinoDigCollection={new InMemoryCollectionStore()} colouringGallery={new InMemoryGalleryStore()} colouringSketches={new InMemorySketchStore()} basePath="/" />)
})

afterEach(() => {
  removeStyles?.()
  vi.useRealTimers()
})

const openFromPicker = (game: Usability) => fireEvent.click(screen.getByRole('button', { name: game.card }))

function leaveTheGame() {
  const home = screen.queryByRole('button', { name: 'Back to games' })
  if (home) return fireEvent.click(home)
  fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
  fireEvent.click(screen.getByRole('button', { name: 'Main menu' }))
}

describe.each(Object.entries(GAMES) as [GameId, Usability][])('%s, from the picker', (id, game) => {
  it('opens with one tap on its card', () => {
    openFromPicker(game)

    expect(screen.queryByRole('heading', { name: 'Pick a game' })).not.toBeInTheDocument()
    expect(game.onScreen()).toBeInTheDocument()
    expect(window.location.pathname).toBe(`/${id}`)
  })

  it('names every button, so nothing is a mystery to a screen reader', () => {
    openFromPicker(game)

    for (const button of screen.getAllByRole('button')) expect(button).toHaveAccessibleName()
  })

  it('unlocks audio with the tap on its card, so a sound the game makes by itself, like a roar at the start, is heard', () => {
    openFromPicker(game)
    const unlockedAt = sound.unlock.mock.invocationCallOrder[0]

    act(() => {
      vi.advanceTimersByTime(8000)
    })

    expect(unlockedAt).toBeDefined()
    for (const playedAt of sound.play.mock.invocationCallOrder) expect(playedAt).toBeGreaterThan(unlockedAt)
  })

  it('can always be left, back to the picker', () => {
    openFromPicker(game)

    leaveTheGame()

    expect(screen.getByRole('heading', { name: 'Pick a game' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it(game.layout === 'scrolls' ? 'scrolls when it is taller than the screen' : 'never lets the page scroll under a fixed stage', () => {
    removeStyles = loadStyles('index.css', 'shared/hud.css', 'shared/overlays.css', game.stylesheet)
    openFromPicker(game)

    const screenStyle = getComputedStyle(screen.getByRole('main'))

    if (game.layout === 'scrolls') expect(screenStyle.overflowY).toBe('auto')
    else expect(screenStyle.overflow).toBe('hidden')
  })
})
