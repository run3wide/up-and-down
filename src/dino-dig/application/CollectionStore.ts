/** The dinosaurs a player has built over time: their museum. */
export interface CollectionStore {
  load(): readonly string[]
  add(dinosaurId: string): void
}
