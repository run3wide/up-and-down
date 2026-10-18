export type AnimalCall = 'moo' | 'meow' | 'woof' | 'oink' | 'buzz' | 'cluck' | 'ribbit' | 'quack' | 'tweet' | 'squeak' | 'neigh' | 'baa' | 'growl'

export type SoundEffect = 'eruption' | 'roar' | 'victoryRoar' | 'winner' | AnimalCall

export interface SoundPlayer {
  /** Browsers only allow audio after a user gesture, so call this from a key press or tap. */
  unlock(): void
  play(effect: SoundEffect): void
}
