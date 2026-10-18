import type { Stroke } from '../domain/drawing'

/** The free drawing a player was working on, kept as they left it. */
export interface SketchStore {
  load(): readonly Stroke[]
  save(strokes: readonly Stroke[]): void
}
