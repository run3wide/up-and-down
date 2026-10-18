import type { GalleryStore } from '../application/GalleryStore'
import type { Fills } from '../domain/picture'

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

/** Storage can be blocked (private windows, strict settings); colouring must still work. */
export class LocalStorageGalleryStore implements GalleryStore {
  private readonly key: string

  constructor(key: string) {
    this.key = key
  }

  load(): Record<string, Fills> {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(this.key) ?? '{}')
      if (!isRecord(stored)) return {}
      return Object.fromEntries(Object.entries(stored).filter(([, fills]) => isRecord(fills)).map(([id, fills]) => [id, onlyNames(fills as Record<string, unknown>)]))
    } catch {
      return {}
    }
  }

  save(templateId: string, fills: Fills) {
    try {
      localStorage.setItem(this.key, JSON.stringify({ ...this.load(), [templateId]: fills }))
    } catch {
      // The picture just won't be kept.
    }
  }
}

const onlyNames = (fills: Record<string, unknown>): Fills =>
  Object.fromEntries(Object.entries(fills).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
