import { describe, expect, it } from 'vitest'
import { BUCKETS, DIFFICULTIES, ITEMS, LEVELS } from './items'

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

describe('the levels', () => {
  it('goes from easy to medium to hard', () => {
    expect(DIFFICULTIES).toEqual(['easy', 'medium', 'hard'])
  })

  it('keeps the original animals, fruit and vehicles as the easy level', () => {
    expect(LEVELS.easy.buckets).toBe(BUCKETS)
    expect(LEVELS.easy.items).toBe(ITEMS)
  })

  it('sorts mammals from fish from birds on medium', () => {
    expect(LEVELS.medium.buckets.map((bucket) => bucket.label)).toEqual(['Mammals', 'Fish', 'Birds'])
  })

  it('adds insects, and animals that look like another kind, on hard', () => {
    const { buckets, items } = LEVELS.hard
    const mammals = items.filter((item) => item.bucket === 'mammals').map((item) => item.name)

    expect(buckets.map((bucket) => bucket.label)).toEqual(['Mammals', 'Birds', 'Fish', 'Insects'])
    expect(mammals).toEqual(expect.arrayContaining(['whale', 'dolphin', 'bat']))
  })

  it.each(DIFFICULTIES)('has every %s item belong in a bucket on the table, with enough of each and no name twice', (difficulty) => {
    const { buckets, items } = LEVELS[difficulty]
    const ids = buckets.map((bucket) => bucket.id)

    expect(items.filter((item) => !ids.includes(item.bucket))).toEqual([])
    for (const id of ids) expect(items.filter((item) => item.bucket === id).length).toBeGreaterThanOrEqual(3)
    expect(new Set(items.map((item) => item.name)).size).toBe(items.length)
    expect(new Set(items.map((item) => item.emoji)).size).toBe(items.length)
  })

  it.each(DIFFICULTIES)('never shows an %s item that looks just like one of its own buckets', (difficulty) => {
    const { buckets, items } = LEVELS[difficulty]
    const pictures = buckets.map((bucket) => bucket.emoji)

    expect(items.filter((item) => pictures.includes(item.emoji))).toEqual([])
  })
})
