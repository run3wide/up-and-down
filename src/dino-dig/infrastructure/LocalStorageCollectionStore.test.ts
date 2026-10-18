import { afterEach, describe, expect, it, vi } from 'vitest'
import { LocalStorageCollectionStore } from './LocalStorageCollectionStore'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('LocalStorageCollectionStore', () => {
  it('starts empty', () => {
    expect(new LocalStorageCollectionStore('museum').load()).toEqual([])
  })

  it('remembers each dinosaur once, across visits', () => {
    new LocalStorageCollectionStore('museum').add('t-rex')
    new LocalStorageCollectionStore('museum').add('t-rex')
    new LocalStorageCollectionStore('museum').add('triceratops')

    expect(new LocalStorageCollectionStore('museum').load()).toEqual(['t-rex', 'triceratops'])
  })

  it('starts again if what was stored is not a list of names', () => {
    localStorage.setItem('museum', '{"oops":1}')
    expect(new LocalStorageCollectionStore('museum').load()).toEqual([])
    localStorage.setItem('museum', 'not json')
    expect(new LocalStorageCollectionStore('museum').load()).toEqual([])
  })

  it('keeps playing when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(() => new LocalStorageCollectionStore('museum').add('t-rex')).not.toThrow()
  })
})
