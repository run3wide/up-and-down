import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { InMemoryGalleryStore } from '../infrastructure/InMemoryGalleryStore'
import { InMemorySketchStore } from '../infrastructure/InMemorySketchStore'
import { TEMPLATES } from '../domain/templates'
import { ColouringScreen } from './ColouringScreen'
import { inFrame } from '../../test-support/inFrame'
import { loadStyles } from '../../test-support/loadStyles'

const trex = TEMPLATES.find(({ id }) => id === 't-rex')!

function renderScreen(gallery = new InMemoryGalleryStore(), sketches = new InMemorySketchStore()) {
  render(inFrame(<ColouringScreen gallery={gallery} sketches={sketches} />))
  return gallery
}

const openPicture = (name: string) => fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${name}`) }))
const chooseColour = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
const part = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name},`) })
const tapPart = (name: string) => fireEvent.click(part(name))

describe('ColouringScreen', () => {
  describe('part numbers', () => {
    afterEach(() => {
      delete (SVGElement.prototype as { isPointInFill?: unknown }).isPointInFill
    })

    it('writes a big number on each part that can be seen, so a helper can say which to colour', () => {
      // A browser would measure the shapes; here whatever is drawn last covers everything.
      Object.assign(SVGElement.prototype, { isPointInFill: () => true })
      renderScreen()

      openPicture('T-Rex')

      const numbers = [...document.querySelectorAll('.colouring__number')]
      expect(numbers.map((number) => number.textContent)).toEqual([String(trex.regions.length)])
    })

    it('does not number the little pictures on the shelf', () => {
      Object.assign(SVGElement.prototype, { isPointInFill: () => true })
      renderScreen()

      expect(document.querySelector('.colouring__number')).toBeNull()
    })
  })

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
    trex.regions.forEach((region, index) => expect(part(region.name)).toHaveAccessibleName(`${region.name}, number ${index + 1}, not coloured`))
  })

  it('colours a part with the chosen colour', () => {
    renderScreen()
    openPicture('T-Rex')

    chooseColour('Green')
    tapPart('Body')

    expect(part('Body')).toHaveAccessibleName(/^Body, number \d+, Green$/)
    expect(part('Head')).toHaveAccessibleName(/^Head, number \d+, not coloured$/)
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

    expect(part('Tail')).toHaveAccessibleName(/^Tail, number \d+, Red$/)
    expect(part('Head')).toHaveAccessibleName(/^Head, number \d+, Red$/)
  })

  it('undoes a colour and clears them all', () => {
    renderScreen()
    openPicture('T-Rex')
    tapPart('Body')
    chooseColour('Pink')
    tapPart('Head')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(part('Head')).toHaveAccessibleName(/^Head, number \d+, not coloured$/)
    expect(part('Body')).toHaveAccessibleName(/^Body, number \d+, Red$/)

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(part('Body')).toHaveAccessibleName(/^Body, number \d+, not coloured$/)
  })

  it('cheers when every part is coloured, and keeps the picture open for more', () => {
    renderScreen()
    openPicture('T-Rex')
    expect(screen.queryByText(/all coloured in/i)).not.toBeInTheDocument()

    for (const region of trex.regions) tapPart(region.name)

    expect(screen.getByRole('status')).toHaveTextContent(/all coloured in/i)
    chooseColour('Teal')
    tapPart('Sky')
    expect(part('Sky')).toHaveAccessibleName(/^Sky, number \d+, Teal$/)
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
    expect(part('Body')).toHaveAccessibleName(/^Body, number \d+, Green$/)
  })

  it('goes back to the shelf with the latest colours', () => {
    renderScreen()
    openPicture('T-Rex')
    tapPart('Body')

    fireEvent.click(screen.getByRole('button', { name: 'My pictures' }))

    expect(screen.getByRole('button', { name: `T-Rex, 1 of ${trex.regions.length} parts coloured` })).toBeInTheDocument()
  })

  describe('free drawing', () => {
    const openPad = (sketches = new InMemorySketchStore()) => {
      renderScreen(new InMemoryGalleryStore(), sketches)
      fireEvent.click(screen.getByRole('button', { name: /^Free draw/ }))
      const pad = screen.getByRole('application', { name: /^Drawing pad/ })
      // jsdom has no layout: say the pad is 200px square at the top left, so one pixel is half a unit.
      pad.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200, x: 0, y: 0, toJSON: () => ({}) })
      return { pad, sketches }
    }
    const drag = (pad: HTMLElement, ...points: [number, number][]) => {
      const [[startX, startY], ...rest] = points
      fireEvent.pointerDown(pad, { clientX: startX, clientY: startY, pointerId: 1 })
      for (const [x, y] of rest) fireEvent.pointerMove(pad, { clientX: x, clientY: y, pointerId: 1 })
      fireEvent.pointerUp(pad, { clientX: points.at(-1)![0], clientY: points.at(-1)![1], pointerId: 1 })
    }

    it('offers a blank page on the shelf', () => {
      renderScreen()

      expect(screen.getByRole('button', { name: 'Free draw, not started' })).toBeInTheDocument()
    })

    it('opens a pad to draw anything on', () => {
      openPad()

      expect(screen.getByRole('heading', { name: 'Draw anything you like' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Red' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByRole('button', { name: 'Medium' })).toHaveAttribute('aria-pressed', 'true')
    })

    it('draws a line where a finger or mouse is dragged, in the chosen colour and brush', () => {
      const { pad, sketches } = openPad()
      chooseColour('Blue')
      chooseColour('Thick')

      drag(pad, [20, 20], [100, 100], [180, 20])

      expect(sketches.load()).toEqual([{ colour: 'blue', brush: 'thick', points: [[10, 10], [50, 50], [90, 10]] }])
    })

    it('draws a dot from a tap', () => {
      const { pad, sketches } = openPad()

      drag(pad, [100, 100])

      expect(sketches.load()).toEqual([{ colour: 'red', brush: 'medium', points: [[50, 50]] }])
    })

    it('ignores moving over the pad when nothing is pressed', () => {
      const { pad, sketches } = openPad()

      fireEvent.pointerMove(pad, { clientX: 50, clientY: 50, pointerId: 1 })

      expect(sketches.load()).toEqual([])
    })

    it('undoes a stroke and clears the page', () => {
      const { pad, sketches } = openPad()
      drag(pad, [20, 20], [40, 40])
      drag(pad, [60, 60], [80, 80])

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      expect(sketches.load()).toHaveLength(1)

      fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
      expect(sketches.load()).toEqual([])
    })

    it('draws from the keyboard: arrow keys draw, space lifts the pen', () => {
      const { pad, sketches } = openPad()

      for (const key of ['ArrowRight', 'ArrowRight', 'ArrowDown']) fireEvent.keyDown(pad, { key })
      fireEvent.keyDown(pad, { key: ' ' })
      fireEvent.keyDown(pad, { key: 'ArrowDown' })
      fireEvent.keyDown(pad, { key: ' ' })

      expect(sketches.load()).toEqual([
        { colour: 'red', brush: 'medium', points: [[50, 50], [54, 50], [58, 50], [58, 54]] },
        { colour: 'red', brush: 'medium', points: [[58, 54], [58, 58]] },
      ])
    })

    it('picks up the drawing from last time, and shows it on the shelf', () => {
      const sketches = new InMemorySketchStore([{ colour: 'green', brush: 'thin', points: [[1, 1], [9, 9]] }])
      renderScreen(new InMemoryGalleryStore(), sketches)

      expect(screen.getByRole('button', { name: 'Free draw, started' })).toBeInTheDocument()
    })

    it('goes back to the shelf', () => {
      openPad()

      fireEvent.click(screen.getByRole('button', { name: 'My pictures' }))

      expect(screen.getByRole('group', { name: 'Pictures' })).toBeInTheDocument()
    })
  })

  it('does not draw a box around a part that has focus: the ring would be the size of the part\'s bounding box, not its shape', () => {
    const removeStyles = loadStyles('colouring/ui/colouring.css')
    const rules = [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules] as CSSStyleRule[])
    const focusRule = rules.find((rule) => rule.selectorText === '.colouring__part:focus')

    expect(focusRule?.style.getPropertyValue('outline')).toBe('none')
    removeStyles()
  })

  it('shows which part has keyboard focus by outlining its own shape', () => {
    const removeStyles = loadStyles('colouring/ui/colouring.css')
    const rules = [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules] as CSSStyleRule[])
    const shapeRule = rules.find((rule) => rule.selectorText === '.colouring__part:focus-visible')

    expect(Number(shapeRule?.style.strokeWidth)).toBeGreaterThan(1)
    removeStyles()
  })
})
