import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import { InMemoryCollectionStore } from '../infrastructure/InMemoryCollectionStore'
import { DigScreen } from './DigScreen'

/** With every random value at 0 the first dig is the T-Rex, buried in the first five cells: skull, ribs, arm, leg, tail. */
const alwaysFirst = () => 0

function renderDig(collection = new InMemoryCollectionStore(), bestScore = 0) {
  const bestScores = new InMemoryBestScoreStore(bestScore)
  const onExit = vi.fn()
  const sound = { unlock: vi.fn(), play: vi.fn() }
  render(<DigScreen random={alwaysFirst} bestScores={bestScores} collection={collection} sound={sound} onExit={onExit} />)
  return { bestScores, collection, onExit, sound }
}

const dirt = () => within(screen.getByRole('group', { name: 'Dig site' })).getAllByRole('button')
const tray = () => within(screen.getByRole('group', { name: 'Bones found' }))
const spots = () => within(screen.getByRole('group', { name: 'Skeleton' })).getAllByRole('button')

function digUpEverything() {
  dirt().slice(0, 5).forEach((cell) => fireEvent.click(cell))
}

function buildEverything() {
  const bones = ['skull', 'ribs', 'arm', 'leg', 'tail']
  bones.forEach((bone, spot) => {
    fireEvent.click(tray().getByRole('button', { name: `Bone: ${bone}` }))
    fireEvent.click(spots()[spot])
  })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('DigScreen', () => {
  it('shows a field of dirt and what it is hiding', () => {
    renderDig()

    expect(dirt()).toHaveLength(30)
    expect(screen.getByRole('heading', { name: 'Dig for a T-Rex!' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
  })

  it('brushes dirt away and says how many bones are close by', () => {
    renderDig()

    fireEvent.click(dirt()[5])

    expect(dirt()[5]).toHaveAccessibleName('Cleared, 1 bone nearby')
  })

  it('lets a bone you find join the others in the tray', () => {
    renderDig()

    fireEvent.click(dirt()[0])

    expect(dirt()[0]).toHaveAccessibleName('Bone: skull')
    expect(screen.getByRole('alert')).toHaveTextContent('You found a skull!')
    expect(tray().getByRole('button', { name: 'Bone: skull' })).toBeInTheDocument()
    expect(screen.getByText('Bones: 1 of 5')).toBeInTheDocument()
  })

  it('moves on to building once every bone is dug up', () => {
    renderDig()

    digUpEverything()

    expect(screen.getByRole('alert')).toHaveTextContent('Now put the bones together!')
    expect(spots()).toHaveLength(5)
  })

  it('does a nuh-uh and sends a bone back when it is put in the wrong spot', () => {
    renderDig()
    digUpEverything()

    fireEvent.click(tray().getByRole('button', { name: 'Bone: skull' }))
    fireEvent.click(spots()[1])

    expect(screen.getByRole('alert')).toHaveTextContent('Nuh-uh! Try another spot.')
    expect(tray().getByRole('button', { name: 'Bone: skull' })).toBeInTheDocument()
  })

  it('keeps a bone that goes in the right spot', () => {
    renderDig()
    digUpEverything()

    fireEvent.click(tray().getByRole('button', { name: 'Bone: skull' }))
    fireEvent.click(spots()[0])

    expect(spots()[0]).toHaveAccessibleName('Skull')
    expect(tray().queryByRole('button', { name: 'Bone: skull' })).not.toBeInTheDocument()
  })

  it('builds the dinosaur, roars, scores and adds it to the museum', () => {
    const { bestScores, collection, sound } = renderDig()
    digUpEverything()

    buildEverything()

    expect(screen.getByRole('alert')).toHaveTextContent('You built a T-Rex!')
    expect(sound.play).toHaveBeenCalledWith('roar')
    expect(screen.getByRole('status')).toHaveTextContent('Score: 1')
    expect(bestScores.load()).toBe(1)
    expect(collection.load()).toEqual(['t-rex'])
  })

  it('stays quiet when sound is muted', () => {
    const { sound } = renderDig()
    fireEvent.click(screen.getByRole('button', { name: 'Mute sound' }))
    digUpEverything()

    buildEverything()

    expect(sound.play).not.toHaveBeenCalled()
  })

  it('digs for a bigger dinosaur after one is built', () => {
    renderDig()
    digUpEverything()
    buildEverything()

    fireEvent.click(screen.getByRole('button', { name: 'Dig again' }))

    expect(screen.getByRole('heading', { name: 'Dig for a Triceratops!' })).toBeInTheDocument()
    expect(dirt()).toHaveLength(30)
  })

  it('shows the museum with the dinosaurs built so far, and keeps the dig as it was', () => {
    renderDig(new InMemoryCollectionStore(['t-rex']))
    fireEvent.click(dirt()[0])

    fireEvent.click(screen.getByRole('button', { name: 'Museum' }))

    const museum = within(screen.getByRole('dialog', { name: 'Museum' }))
    expect(museum.getByText('1 of 4 dinosaurs')).toBeInTheDocument()
    expect(museum.getByLabelText('T-Rex')).toBeInTheDocument()
    expect(museum.getAllByLabelText('Not built yet')).toHaveLength(3)

    fireEvent.click(museum.getByRole('button', { name: 'Back to digging' }))
    expect(dirt()[0]).toHaveAccessibleName('Bone: skull')
  })

  it('pauses and goes back to the main menu', () => {
    const { onExit } = renderDig()

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Main menu' }))
    })

    expect(onExit).toHaveBeenCalled()
  })
})
