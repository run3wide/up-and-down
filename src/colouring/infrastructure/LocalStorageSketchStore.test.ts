import { afterEach, describe, expect, it, vi } from 'vitest'
import { LocalStorageSketchStore } from './LocalStorageSketchStore'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

const stroke = { colour: 'red', brush: 'thin', points: [[1, 2], [3, 4]] as const }

describe('LocalStorageSketchStore', () => {
  it('starts empty', () => {
    expect(new LocalStorageSketchStore('sketch').load()).toEqual([])
  })

  it('remembers the drawing across visits', () => {
    new LocalStorageSketchStore('sketch').save([stroke])

    expect(new LocalStorageSketchStore('sketch').load()).toEqual([stroke])
  })

  it('starts again if what was stored is not a list of strokes', () => {
    localStorage.setItem('sketch', '{"oops":1}')
    expect(new LocalStorageSketchStore('sketch').load()).toEqual([])
    localStorage.setItem('sketch', 'not json')
    expect(new LocalStorageSketchStore('sketch').load()).toEqual([])
  })

  it('keeps only what looks like a stroke', () => {
    localStorage.setItem('sketch', JSON.stringify([stroke, { colour: 'red' }, 'oops', null]))

    expect(new LocalStorageSketchStore('sketch').load()).toEqual([stroke])
  })

  it('keeps drawing when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(() => new LocalStorageSketchStore('sketch').save([stroke])).not.toThrow()
  })
})
