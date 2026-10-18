import type { SketchStore } from '../application/SketchStore'
import type { Stroke } from '../domain/drawing'

const looksLikeStroke = (value: unknown): value is Stroke =>
  typeof value === 'object' && value !== null && 'colour' in value && 'brush' in value && 'points' in value && Array.isArray(value.points)

/** Storage can be blocked (private windows, strict settings); drawing must still work. */
export class LocalStorageSketchStore implements SketchStore {
  private readonly key: string

  constructor(key: string) {
    this.key = key
  }

  load(): readonly Stroke[] {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(this.key) ?? '[]')
      return Array.isArray(stored) ? stored.filter(looksLikeStroke) : []
    } catch {
      return []
    }
  }

  save(strokes: readonly Stroke[]) {
    try {
      localStorage.setItem(this.key, JSON.stringify(strokes))
    } catch {
      // The drawing just won't be kept.
    }
  }
}
