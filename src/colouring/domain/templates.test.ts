import { describe, expect, it } from 'vitest'
import { TEMPLATES } from './templates'

const MIN_PARTS = 12

describe('colouring templates', () => {
  it('has a few pictures to choose from, each with its own id', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(5)
    expect(new Set(TEMPLATES.map(({ id }) => id)).size).toBe(TEMPLATES.length)
  })

  it.each(['car', 'truck', 'bus', 'garbage-truck', 'hippo', 'elephant', 'tiger', 'snake', 'hamburger',
    'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune',
    'space-shuttle', 'ufo', 'astronaut', 'satellite', 'big-rocket'])(
    'has a %s to colour',
    (id) => {
      expect(TEMPLATES.map((template) => template.id)).toContain(id)
    },
  )

  describe.each(TEMPLATES.map((template) => [template.name, template] as const))('%s', (_name, template) => {
    it(`has at least ${MIN_PARTS} parts to colour, so there is plenty to be creative with`, () => {
      expect(template.regions.length).toBeGreaterThanOrEqual(MIN_PARTS)
    })

    it('names every part differently, so a screen reader can tell them apart', () => {
      const names = template.regions.map(({ name }) => name)

      expect(names.every((name) => name.trim() !== '')).toBe(true)
      expect(new Set(names).size).toBe(names.length)
      expect(new Set(template.regions.map(({ id }) => id)).size).toBe(names.length)
    })

    it('draws every part with a path made only of numbers and path commands', () => {
      for (const { path } of [...template.regions, ...template.lines.map((path) => ({ path }))]) {
        expect(path).toMatch(/^[MmLlHhVvCcSsQqTtAaZz0-9\s.,-]+$/)
        expect(path).not.toContain('NaN')
      }
    })
  })
})
