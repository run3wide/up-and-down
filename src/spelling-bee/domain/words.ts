import type { SoundEffect } from '../../shared/sound/SoundPlayer'

export interface Word {
  readonly spelling: string
  readonly emoji: string
  /** What the animal says when its word is spelled; things that don't make a noise have none. */
  readonly sound?: SoundEffect
}

/** Each word is something a picture can show, so a child can see what to spell. */
export const WORDS: readonly Word[] = [
  { spelling: 'CAT', emoji: '🐱', sound: 'meow' },
  { spelling: 'DOG', emoji: '🐶', sound: 'woof' },
  { spelling: 'PIG', emoji: '🐷', sound: 'oink' },
  { spelling: 'COW', emoji: '🐮', sound: 'moo' },
  { spelling: 'BEE', emoji: '🐝', sound: 'buzz' },
  { spelling: 'HEN', emoji: '🐔', sound: 'cluck' },
  { spelling: 'FOX', emoji: '🦊', sound: 'yip' },
  { spelling: 'EGG', emoji: '🥚' },
  { spelling: 'PIE', emoji: '🥧' },
  { spelling: 'SUN', emoji: '☀️' },
  { spelling: 'BUS', emoji: '🚌' },
  { spelling: 'CAR', emoji: '🚗' },
  { spelling: 'HAT', emoji: '🎩' },
  { spelling: 'FISH', emoji: '🐟' },
  { spelling: 'DUCK', emoji: '🦆', sound: 'quack' },
  { spelling: 'FROG', emoji: '🐸', sound: 'ribbit' },
  { spelling: 'BEAR', emoji: '🐻' },
  { spelling: 'LION', emoji: '🦁', sound: 'lion' },
  { spelling: 'GOAT', emoji: '🐐', sound: 'bleat' },
  { spelling: 'DINO', emoji: '🦖', sound: 'roar' },
  { spelling: 'BIRD', emoji: '🐦', sound: 'peep' },
  { spelling: 'CAKE', emoji: '🍰' },
  { spelling: 'MILK', emoji: '🥛' },
  { spelling: 'CORN', emoji: '🌽' },
  { spelling: 'PEAR', emoji: '🍐' },
  { spelling: 'STAR', emoji: '⭐' },
  { spelling: 'MOON', emoji: '🌙' },
  { spelling: 'TREE', emoji: '🌳' },
  { spelling: 'CHICK', emoji: '🐥', sound: 'peep' },
  { spelling: 'APPLE', emoji: '🍎' },
  { spelling: 'PIZZA', emoji: '🍕' },
  { spelling: 'MOUSE', emoji: '🐭', sound: 'squeak' },
  { spelling: 'TIGER', emoji: '🐯', sound: 'tiger' },
  { spelling: 'ZEBRA', emoji: '🦓', sound: 'bray' },
  { spelling: 'GRAPE', emoji: '🍇' },
  { spelling: 'BREAD', emoji: '🍞' },
  { spelling: 'LEMON', emoji: '🍋' },
  { spelling: 'HORSE', emoji: '🐴', sound: 'neigh' },
  { spelling: 'SHEEP', emoji: '🐑', sound: 'baa' },
]
