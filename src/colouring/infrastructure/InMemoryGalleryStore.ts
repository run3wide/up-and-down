import type { GalleryStore } from '../application/GalleryStore'
import type { Fills } from '../domain/picture'

export class InMemoryGalleryStore implements GalleryStore {
  private pictures: Record<string, Fills>

  constructor(pictures: Readonly<Record<string, Fills>> = {}) {
    this.pictures = { ...pictures }
  }

  load() {
    return { ...this.pictures }
  }

  save(templateId: string, fills: Fills) {
    this.pictures = { ...this.pictures, [templateId]: fills }
  }
}
