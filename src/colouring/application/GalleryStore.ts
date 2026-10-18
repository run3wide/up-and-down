import type { Fills } from '../domain/picture'

/** Each picture a player has started colouring, kept as they left it so they can pick it up again. */
export interface GalleryStore {
  load(): Readonly<Record<string, Fills>>
  save(templateId: string, fills: Fills): void
}
