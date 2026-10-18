import { describe, expect, it } from 'vitest'
import { COLOURS } from './colours'
import { Picture } from './picture'
import type { Template } from './templates'

const TWO_PART_TEMPLATE: Template = {
  id: 'blob',
  name: 'Blob',
  regions: [
    { id: 'body', name: 'body', path: 'M0 0H50V50H0Z' },
    { id: 'hat', name: 'hat', path: 'M50 50H100V100H50Z' },
  ],
  lines: [],
}

const [red, blue] = COLOURS

describe('Picture', () => {
  it('starts with every part uncoloured', () => {
    const picture = new Picture(TWO_PART_TEMPLATE)

    expect(picture.snapshot().fills).toEqual({})
    expect(picture.snapshot().finished).toBe(false)
  })

  it('colours a part with the chosen colour', () => {
    const picture = new Picture(TWO_PART_TEMPLATE)

    const events = picture.fill('body', red.id)

    expect(events).toEqual([{ type: 'filled', region: 'body', colour: red.id }])
    expect(picture.snapshot().fills).toEqual({ body: red.id })
  })

  it('lets a part be coloured again with another colour', () => {
    const picture = new Picture(TWO_PART_TEMPLATE)
    picture.fill('body', red.id)

    picture.fill('body', blue.id)

    expect(picture.snapshot().fills).toEqual({ body: blue.id })
  })

  it('ignores a part or a colour it does not know', () => {
    const picture = new Picture(TWO_PART_TEMPLATE)

    expect(picture.fill('tail', red.id)).toEqual([])
    expect(picture.fill('body', 'not-a-colour')).toEqual([])
    expect(picture.snapshot().fills).toEqual({})
  })

  it('does nothing when a part already has that colour', () => {
    const picture = new Picture(TWO_PART_TEMPLATE)
    picture.fill('body', red.id)

    expect(picture.fill('body', red.id)).toEqual([])
  })

  it('is finished once every part has a colour, and says so once', () => {
    const picture = new Picture(TWO_PART_TEMPLATE)
    picture.fill('body', red.id)

    const events = picture.fill('hat', blue.id)
    const recoloured = picture.fill('hat', red.id)

    expect(events).toEqual([
      { type: 'filled', region: 'hat', colour: blue.id },
      { type: 'finished' },
    ])
    expect(recoloured).toEqual([{ type: 'filled', region: 'hat', colour: red.id }])
    expect(picture.snapshot().finished).toBe(true)
  })

  it('undoes the last colour, one step at a time, back to the colour before', () => {
    const picture = new Picture(TWO_PART_TEMPLATE)
    picture.fill('body', red.id)
    picture.fill('body', blue.id)

    picture.undo()
    expect(picture.snapshot().fills).toEqual({ body: red.id })
    picture.undo()
    expect(picture.snapshot().fills).toEqual({})
    picture.undo()
    expect(picture.snapshot().fills).toEqual({})
  })

  it('wipes the colours clean, and that can be undone', () => {
    const picture = new Picture(TWO_PART_TEMPLATE)
    picture.fill('body', red.id)
    picture.fill('hat', blue.id)

    picture.clear()
    expect(picture.snapshot().fills).toEqual({})

    picture.undo()
    expect(picture.snapshot().fills).toEqual({ body: red.id, hat: blue.id })
  })

  it('picks up where a saved picture left off, dropping anything that no longer fits', () => {
    const picture = new Picture(TWO_PART_TEMPLATE, { body: red.id, tail: red.id, hat: 'not-a-colour' })

    expect(picture.snapshot().fills).toEqual({ body: red.id })
  })
})
