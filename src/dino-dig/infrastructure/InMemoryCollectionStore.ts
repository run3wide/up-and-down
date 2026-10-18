import type { CollectionStore } from '../application/CollectionStore'

export class InMemoryCollectionStore implements CollectionStore {
  private collected: string[]

  constructor(collected: readonly string[] = []) {
    this.collected = [...collected]
  }

  load(): readonly string[] {
    return [...this.collected]
  }

  add(dinosaurId: string): void {
    if (!this.collected.includes(dinosaurId)) this.collected.push(dinosaurId)
  }
}
