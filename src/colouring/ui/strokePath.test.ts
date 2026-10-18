import { describe, expect, it } from 'vitest'
import { strokePath } from './strokePath'

describe('strokePath', () => {
  it('makes a dot out of a single point', () => {
    expect(strokePath([[5, 5]])).toBe('M5 5l0 0')
  })

  it('draws a straight line between two points', () => {
    expect(strokePath([[0, 0], [10, 10]])).toBe('M0 0L10 10')
  })

  it('smooths the corners of a longer stroke through the middle of each pair of points', () => {
    expect(strokePath([[0, 0], [10, 0], [10, 10], [20, 10]])).toBe('M0 0Q10 0 10 5Q10 10 15 10L20 10')
  })
})
