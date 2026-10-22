import { describe, expect, it } from 'vitest'
import { matchesAnswer, type Term } from './sum'

const term = (count: number, symbol: string): Term => ({ count, symbol })

describe('matchesAnswer', () => {
  it('accepts the terms in the same order', () => {
    expect(matchesAnswer([term(4, 'x'), term(3, 'y')], [term(4, 'x'), term(3, 'y')])).toBe(true)
  })

  it('accepts the terms in any order, because adding can be done either way round', () => {
    expect(matchesAnswer([term(3, 'y'), term(4, 'x')], [term(4, 'x'), term(3, 'y')])).toBe(true)
  })

  it('rejects the right numbers on the wrong things', () => {
    expect(matchesAnswer([term(3, 'x'), term(4, 'y')], [term(4, 'x'), term(3, 'y')])).toBe(false)
  })

  it('rejects a different number of terms', () => {
    expect(matchesAnswer([term(7, 'x')], [term(4, 'x'), term(3, 'y')])).toBe(false)
    expect(matchesAnswer([term(4, 'x'), term(3, 'y')], [term(7, 'x')])).toBe(false)
  })

  it('rejects the same term written twice for two different ones', () => {
    expect(matchesAnswer([term(4, 'x'), term(4, 'x')], [term(4, 'x'), term(3, 'y')])).toBe(false)
  })
})
