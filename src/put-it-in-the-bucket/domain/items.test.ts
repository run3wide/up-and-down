import { describe, expect, it } from 'vitest'
import { BUCKETS, ITEMS } from './items'

describe('the things to sort', () => {
  it('has a dog, a strawberry and a truck to sort into', () => {
    expect(BUCKETS.map((bucket) => bucket.emoji)).toEqual(['🐶', '🍓', '🚚'])
  })

  it('belongs every item in a bucket that is on the table', () => {
    const ids = BUCKETS.map((bucket) => bucket.id)

    expect(ITEMS.filter((item) => !ids.includes(item.bucket))).toEqual([])
  })

  it('has plenty of every kind and no name twice', () => {
    for (const bucket of BUCKETS) {
      expect(ITEMS.filter((item) => item.bucket === bucket.id).length).toBeGreaterThanOrEqual(6)
    }
    expect(new Set(ITEMS.map((item) => item.name)).size).toBe(ITEMS.length)
  })
})
