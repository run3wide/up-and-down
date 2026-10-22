import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FLAVOURS, FROSTINGS, SHAPES, TOPPINGS } from '../domain/ingredients'
import { CakeArt } from './CakeArt'

const paint = (container: HTMLElement, part: string) => container.querySelector(`[data-part="${part}"]`)
const fills = (container: HTMLElement, part: string) => [...container.querySelectorAll(`[data-part="${part}"]`)].map((element) => element.getAttribute('fill'))

describe('CakeArt', () => {
  it.each(SHAPES)('draws a $name cake, with its own outline', ({ name }) => {
    const { container } = render(<CakeArt cake={{ shape: SHAPES.find((shape) => shape.name === name) }} />)

    expect(container.querySelector('svg')).toHaveAttribute('data-shape', name)
    expect(container.querySelectorAll('[data-part="sponge"]').length).toBeGreaterThan(0)
  })

  it('has a different outline for every shape', () => {
    const outlines = SHAPES.map((shape) => {
      const { container } = render(<CakeArt cake={{ shape }} />)
      return [...container.querySelectorAll('[data-part="sponge"]')].map((part) => part.getAttribute('d')).join('|')
    })

    expect(new Set(outlines).size).toBe(SHAPES.length)
  })

  it('shows the sponge in the flavour colour and the frosting on top in its own colour', () => {
    const chocolate = FLAVOURS.find((flavour) => flavour.name === 'Chocolate')!
    const lemon = FROSTINGS.find((frosting) => frosting.name === 'Lemon')!

    const { container } = render(<CakeArt cake={{ shape: SHAPES[0], flavour: chocolate, frosting: lemon }} />)

    expect(new Set(fills(container, 'sponge'))).toEqual(new Set([chocolate.colour]))
    expect(new Set(fills(container, 'frosting'))).toEqual(new Set([lemon.colour]))
  })

  it('has no frosting layer to paint until one is chosen: the top is plain sponge', () => {
    const { container } = render(<CakeArt cake={{ shape: SHAPES[1], flavour: FLAVOURS[1] }} />)

    expect(new Set(fills(container, 'frosting'))).toEqual(new Set([FLAVOURS[1].colour]))
  })

  it.each(TOPPINGS)('scatters $name over the cake', (topping) => {
    const { container } = render(<CakeArt cake={{ shape: SHAPES[2], flavour: FLAVOURS[0], frosting: FROSTINGS[0], topping }} />)

    expect(container.querySelectorAll(`[data-topping="${topping.name}"]`).length).toBeGreaterThanOrEqual(5)
  })

  it('shows no toppings before one is chosen', () => {
    const { container } = render(<CakeArt cake={{ shape: SHAPES[3] }} />)

    expect(container.querySelector('[data-topping]')).toBeNull()
    expect(paint(container, 'frosting')).not.toBeNull()
  })
})
