export type AnimalCall = 'moo' | 'baa' | 'bleat' | 'meow' | 'woof' | 'oink' | 'neigh' | 'peep' | 'ribbit' | 'buzz' | 'quack' | 'cluck' | 'squeak' | 'lion' | 'tiger' | 'yip' | 'bray'

export type SoundEffect = 'eruption' | 'roar' | 'victoryRoar' | 'winner' | 'brickSnap' | 'brickPop' | 'builtIt' | AnimalCall

export interface SoundPlayer {
  /** Browsers only allow audio after a user gesture, so call this from a key press or tap. */
  unlock(): void
  play(effect: SoundEffect): void
}
