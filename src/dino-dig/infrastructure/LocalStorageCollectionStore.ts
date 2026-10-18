import type { CollectionStore } from '../application/CollectionStore'

/** Storage can be blocked (private windows, strict settings); the game must still play. */
export class LocalStorageCollectionStore implements CollectionStore {
  private readonly key: string

  constructor(key: string) {
    this.key = key
  }

  load(): readonly string[] {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(this.key) ?? '[]')
      return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : []
    } catch {
      return []
    }
  }

  add(dinosaurId: string): void {
    const collected = this.load()
    if (collected.includes(dinosaurId)) return
    try {
      localStorage.setItem(this.key, JSON.stringify([...collected, dinosaurId]))
    } catch {
      // The museum just won't persist.
    }
  }
}
