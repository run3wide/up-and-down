export interface Bucket {
  readonly id: string
  readonly emoji: string
  readonly label: string
  /** What an item in it is, for "Yes! A cow is an animal." */
  readonly phrase: string
}

export interface Item {
  readonly name: string
  readonly emoji: string
  readonly bucket: string
}

export const BUCKETS: readonly Bucket[] = [
  { id: 'animals', emoji: '🐶', label: 'Animals', phrase: 'an animal' },
  { id: 'fruit', emoji: '🍓', label: 'Fruit', phrase: 'a fruit' },
  { id: 'vehicles', emoji: '🚚', label: 'Vehicles', phrase: 'a vehicle' },
]

export const ITEMS: readonly Item[] = [
  { name: 'cow', emoji: '🐮', bucket: 'animals' },
  { name: 'cat', emoji: '🐱', bucket: 'animals' },
  { name: 'pig', emoji: '🐷', bucket: 'animals' },
  { name: 'duck', emoji: '🦆', bucket: 'animals' },
  { name: 'horse', emoji: '🐴', bucket: 'animals' },
  { name: 'elephant', emoji: '🐘', bucket: 'animals' },
  { name: 'apple', emoji: '🍎', bucket: 'fruit' },
  { name: 'banana', emoji: '🍌', bucket: 'fruit' },
  { name: 'grapes', emoji: '🍇', bucket: 'fruit' },
  { name: 'orange', emoji: '🍊', bucket: 'fruit' },
  { name: 'pear', emoji: '🍐', bucket: 'fruit' },
  { name: 'watermelon', emoji: '🍉', bucket: 'fruit' },
  { name: 'bus', emoji: '🚌', bucket: 'vehicles' },
  { name: 'car', emoji: '🚗', bucket: 'vehicles' },
  { name: 'tractor', emoji: '🚜', bucket: 'vehicles' },
  { name: 'train', emoji: '🚂', bucket: 'vehicles' },
  { name: 'plane', emoji: '✈️', bucket: 'vehicles' },
  { name: 'fire engine', emoji: '🚒', bucket: 'vehicles' },
]

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export interface Level {
  readonly buckets: readonly Bucket[]
  readonly items: readonly Item[]
}

const MAMMALS: Bucket = { id: 'mammals', emoji: '🐶', label: 'Mammals', phrase: 'a mammal' }
const FISH: Bucket = { id: 'fish', emoji: '🐟', label: 'Fish', phrase: 'a fish' }
const BIRDS: Bucket = { id: 'birds', emoji: '🐦', label: 'Birds', phrase: 'a bird' }
const INSECTS: Bucket = { id: 'insects', emoji: '🦋', label: 'Insects', phrase: 'an insect' }

const MEDIUM_ITEMS: readonly Item[] = [
  { name: 'cow', emoji: '🐮', bucket: 'mammals' },
  { name: 'pig', emoji: '🐷', bucket: 'mammals' },
  { name: 'horse', emoji: '🐴', bucket: 'mammals' },
  { name: 'elephant', emoji: '🐘', bucket: 'mammals' },
  { name: 'rabbit', emoji: '🐰', bucket: 'mammals' },
  { name: 'lion', emoji: '🦁', bucket: 'mammals' },
  { name: 'tropical fish', emoji: '🐠', bucket: 'fish' },
  { name: 'pufferfish', emoji: '🐡', bucket: 'fish' },
  { name: 'shark', emoji: '🦈', bucket: 'fish' },
  { name: 'duck', emoji: '🦆', bucket: 'birds' },
  { name: 'owl', emoji: '🦉', bucket: 'birds' },
  { name: 'eagle', emoji: '🦅', bucket: 'birds' },
  { name: 'parrot', emoji: '🦜', bucket: 'birds' },
  { name: 'chicken', emoji: '🐔', bucket: 'birds' },
  { name: 'swan', emoji: '🦢', bucket: 'birds' },
]

/** The whale, dolphin, seal and bat are the catches: each looks like it belongs in another bucket. */
const HARD_ITEMS: readonly Item[] = [
  { name: 'whale', emoji: '🐳', bucket: 'mammals' },
  { name: 'dolphin', emoji: '🐬', bucket: 'mammals' },
  { name: 'seal', emoji: '🦭', bucket: 'mammals' },
  { name: 'bat', emoji: '🦇', bucket: 'mammals' },
  { name: 'elephant', emoji: '🐘', bucket: 'mammals' },
  { name: 'rabbit', emoji: '🐰', bucket: 'mammals' },
  { name: 'penguin', emoji: '🐧', bucket: 'birds' },
  { name: 'flamingo', emoji: '🦩', bucket: 'birds' },
  { name: 'peacock', emoji: '🦚', bucket: 'birds' },
  { name: 'turkey', emoji: '🦃', bucket: 'birds' },
  { name: 'owl', emoji: '🦉', bucket: 'birds' },
  { name: 'tropical fish', emoji: '🐠', bucket: 'fish' },
  { name: 'pufferfish', emoji: '🐡', bucket: 'fish' },
  { name: 'shark', emoji: '🦈', bucket: 'fish' },
  { name: 'bee', emoji: '🐝', bucket: 'insects' },
  { name: 'ladybird', emoji: '🐞', bucket: 'insects' },
  { name: 'ant', emoji: '🐜', bucket: 'insects' },
  { name: 'cricket', emoji: '🦗', bucket: 'insects' },
]

export const LEVELS: Record<Difficulty, Level> = {
  easy: { buckets: BUCKETS, items: ITEMS },
  medium: { buckets: [MAMMALS, FISH, BIRDS], items: MEDIUM_ITEMS },
  hard: { buckets: [MAMMALS, BIRDS, FISH, INSECTS], items: HARD_ITEMS },
}
