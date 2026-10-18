import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InMemoryGalleryStore } from '../infrastructure/InMemoryGalleryStore'
import { TEMPLATES } from '../domain/templates'
import { ColouringScreen } from './ColouringScreen'

const trex = TEMPLATES.find(({ id }) => id === 't-rex')!

function renderScreen(gallery = new InMemoryGalleryStore(), onExit = () => {}) {
  render(<ColouringScreen gallery={gallery} onExit={onExit} />)
  return gallery
}

const openPicture = (name: string) => fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${name}`) }))
const chooseColour = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
const part = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name},`) })
const tapPart = (name: string) => fireEvent.click(part(name))

describe('ColouringScreen', () => {
  it('offers every picture on a shelf, none of them coloured yet', () => {
    renderScreen()

    const shelf = screen.getByRole('group', { name: 'Pictures' })
    for (const template of TEMPLATES) {
      expect(within(shelf).getByRole('button', { name: `${template.name}, not started` })).toBeInTheDocument()
    }
  })

  it('opens a picture with every part blank', () => {
    renderScreen()

    openPicture('T-Rex')

    expect(screen.getByRole('heading', { name: 'Colour the T-Rex' })).toBeInTheDocument()
    for (const region of trex.regions) expect(part(region.name)).toHaveAccessibleName(`${region.name}, not coloured`)
  })

  it('colours a part with the chosen colour', () => {
    renderScreen()
    openPicture('T-Rex')

    chooseColour('Green')
    tapPart('Body')

    expect(part('Body')).toHaveAccessibleName('Body, Green')
    expect(part('Head')).toHaveAccessibleName('Head, not coloured')
  })

  it('shows which colour is chosen, starting with the first', () => {
    renderScreen()
    openPicture('T-Rex')

    expect(screen.getByRole('button', { name: 'Red' })).toHaveAttribute('aria-pressed', 'true')
    chooseColour('Blue')
    expect(screen.getByRole('button', { name: 'Blue' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Red' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('colours a part from the keyboard', () => {
    renderScreen()
    openPicture('T-Rex')

    fireEvent.keyDown(part('Tail'), { key: 'Enter' })
    fireEvent.keyDown(part('Head'), { key: ' ' })

    expect(part('Tail')).toHaveAccessibleName('Tail, Red')
    expect(part('Head')).toHaveAccessibleName('Head, Red')
  })

  it('undoes a colour and clears them all', () => {
    renderScreen()
    openPicture('T-Rex')
    tapPart('Body')
    chooseColour('Pink')
    tapPart('Head')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(part('Head')).toHaveAccessibleName('Head, not coloured')
    expect(part('Body')).toHaveAccessibleName('Body, Red')

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(part('Body')).toHaveAccessibleName('Body, not coloured')
  })

  it('cheers when every part is coloured, and keeps the picture open for more', () => {
    renderScreen()
    openPicture('T-Rex')
    expect(screen.queryByText(/all coloured in/i)).not.toBeInTheDocument()

    for (const region of trex.regions) tapPart(region.name)

    expect(screen.getByRole('status')).toHaveTextContent(/all coloured in/i)
    chooseColour('Teal')
    tapPart('Sky')
    expect(part('Sky')).toHaveAccessibleName('Sky, Teal')
  })

  it('keeps a picture as it was left, and picks it up again next time', () => {
    const gallery = renderScreen()
    openPicture('T-Rex')
    chooseColour('Orange')
    tapPart('Body')

    expect(gallery.load()['t-rex']).toEqual({ body: 'orange' })
  })

  it('shows on the shelf how far each picture has got', () => {
    renderScreen(new InMemoryGalleryStore({ 't-rex': { body: 'green', head: 'green' } }))

    expect(screen.getByRole('button', { name: `T-Rex, 2 of ${trex.regions.length} parts coloured` })).toBeInTheDocument()
    openPicture('T-Rex')
    expect(part('Body')).toHaveAccessibleName('Body, Green')
  })

  it('goes back to the shelf with the latest colours', () => {
    renderScreen()
    openPicture('T-Rex')
    tapPart('Body')

    fireEvent.click(screen.getByRole('button', { name: 'My pictures' }))

    expect(screen.getByRole('button', { name: `T-Rex, 1 of ${trex.regions.length} parts coloured` })).toBeInTheDocument()
  })

  it('leaves for the game picker from the shelf', () => {
    const onExit = vi.fn()
    renderScreen(new InMemoryGalleryStore(), onExit)

    fireEvent.click(screen.getByRole('button', { name: 'Back to games' }))

    expect(onExit).toHaveBeenCalledOnce()
  })
})
