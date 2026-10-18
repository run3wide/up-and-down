import type { SketchStore } from '../application/SketchStore'
import type { Stroke } from '../domain/drawing'

export class InMemorySketchStore implements SketchStore {
  private strokes: readonly Stroke[]

  constructor(strokes: readonly Stroke[] = []) {
    this.strokes = strokes
  }

  load() {
    return this.strokes
  }

  save(strokes: readonly Stroke[]) {
    this.strokes = strokes
  }
}
