import { afterEach, describe, expect, it, vi } from 'vitest'
import { LocalStorageGalleryStore } from './LocalStorageGalleryStore'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('LocalStorageGalleryStore', () => {
  it('starts empty', () => {
    expect(new LocalStorageGalleryStore('gallery').load()).toEqual({})
  })

  it('remembers each picture as it was left, across visits', () => {
    new LocalStorageGalleryStore('gallery').save('t-rex', { body: 'green' })
    new LocalStorageGalleryStore('gallery').save('rocket', { nose: 'red' })
    new LocalStorageGalleryStore('gallery').save('t-rex', { body: 'blue', eye: 'white' })

    expect(new LocalStorageGalleryStore('gallery').load()).toEqual({
      't-rex': { body: 'blue', eye: 'white' },
      rocket: { nose: 'red' },
    })
  })

  it('starts again if what was stored is not a set of pictures', () => {
    localStorage.setItem('gallery', '["oops"]')
    expect(new LocalStorageGalleryStore('gallery').load()).toEqual({})
    localStorage.setItem('gallery', 'not json')
    expect(new LocalStorageGalleryStore('gallery').load()).toEqual({})
  })

  it('keeps only parts that are coloured with a colour name', () => {
    localStorage.setItem('gallery', JSON.stringify({ 't-rex': { body: 'green', eye: 7 }, rocket: 'oops' }))

    expect(new LocalStorageGalleryStore('gallery').load()).toEqual({ 't-rex': { body: 'green' } })
  })

  it('keeps colouring when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(() => new LocalStorageGalleryStore('gallery').save('t-rex', { body: 'green' })).not.toThrow()
  })
})
