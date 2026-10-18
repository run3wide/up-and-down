export type SoundEffect = 'eruption' | 'roar'

export interface SoundPlayer {
  /** Browsers only allow audio after a user gesture, so call this from a key press or tap. */
  unlock(): void
  play(effect: SoundEffect): void
}
