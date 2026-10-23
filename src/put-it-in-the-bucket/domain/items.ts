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
  { id: 'toys', emoji: '🧸', label: 'Toys', phrase: 'a toy' },
]

export const ITEMS: readonly Item[] = [
  { name: 'cow', emoji: '🐮', bucket: 'animals' },
  { name: 'cat', emoji: '🐱', bucket: 'animals' },
  { name: 'pig', emoji: '🐷', bucket: 'animals' },
  { name: 'duck', emoji: '🦆', bucket: 'animals' },
  { name: 'horse', emoji: '🐴', bucket: 'animals' },
  { name: 'elephant', emoji: '🐘', bucket: 'animals' },
  { name: 'sheep', emoji: '🐑', bucket: 'animals' },
  { name: 'monkey', emoji: '🐵', bucket: 'animals' },
  { name: 'giraffe', emoji: '🦒', bucket: 'animals' },
  { name: 'bear', emoji: '🐻', bucket: 'animals' },
  { name: 'apple', emoji: '🍎', bucket: 'fruit' },
  { name: 'banana', emoji: '🍌', bucket: 'fruit' },
  { name: 'grapes', emoji: '🍇', bucket: 'fruit' },
  { name: 'orange', emoji: '🍊', bucket: 'fruit' },
  { name: 'pear', emoji: '🍐', bucket: 'fruit' },
  { name: 'watermelon', emoji: '🍉', bucket: 'fruit' },
  { name: 'cherries', emoji: '🍒', bucket: 'fruit' },
  { name: 'peach', emoji: '🍑', bucket: 'fruit' },
  { name: 'lemon', emoji: '🍋', bucket: 'fruit' },
  { name: 'pineapple', emoji: '🍍', bucket: 'fruit' },
  { name: 'kiwi', emoji: '🥝', bucket: 'fruit' },
  { name: 'bus', emoji: '🚌', bucket: 'vehicles' },
  { name: 'car', emoji: '🚗', bucket: 'vehicles' },
  { name: 'tractor', emoji: '🚜', bucket: 'vehicles' },
  { name: 'train', emoji: '🚂', bucket: 'vehicles' },
  { name: 'plane', emoji: '✈️', bucket: 'vehicles' },
  { name: 'fire engine', emoji: '🚒', bucket: 'vehicles' },
  { name: 'ambulance', emoji: '🚑', bucket: 'vehicles' },
  { name: 'bike', emoji: '🚲', bucket: 'vehicles' },
  { name: 'helicopter', emoji: '🚁', bucket: 'vehicles' },
  { name: 'boat', emoji: '⛵', bucket: 'vehicles' },
  { name: 'police car', emoji: '🚓', bucket: 'vehicles' },
  { name: 'motorbike', emoji: '🏍️', bucket: 'vehicles' },
  { name: 'ball', emoji: '⚽', bucket: 'toys' },
  { name: 'kite', emoji: '🪁', bucket: 'toys' },
  { name: 'drum', emoji: '🥁', bucket: 'toys' },
  { name: 'balloon', emoji: '🎈', bucket: 'toys' },
  { name: 'puzzle', emoji: '🧩', bucket: 'toys' },
  { name: 'yo-yo', emoji: '🪀', bucket: 'toys' },
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
const REPTILES: Bucket = { id: 'reptiles', emoji: '🐍', label: 'Reptiles', phrase: 'a reptile' }
const INSECTS: Bucket = { id: 'insects', emoji: '🦋', label: 'Insects', phrase: 'an insect' }

const MEDIUM_ITEMS: readonly Item[] = [
  { name: 'cow', emoji: '🐮', bucket: 'mammals' },
  { name: 'pig', emoji: '🐷', bucket: 'mammals' },
  { name: 'horse', emoji: '🐴', bucket: 'mammals' },
  { name: 'elephant', emoji: '🐘', bucket: 'mammals' },
  { name: 'rabbit', emoji: '🐰', bucket: 'mammals' },
  { name: 'lion', emoji: '🦁', bucket: 'mammals' },
  { name: 'bear', emoji: '🐻', bucket: 'mammals' },
  { name: 'monkey', emoji: '🐵', bucket: 'mammals' },
  { name: 'zebra', emoji: '🦓', bucket: 'mammals' },
  { name: 'camel', emoji: '🐪', bucket: 'mammals' },
  { name: 'fox', emoji: '🦊', bucket: 'mammals' },
  { name: 'tropical fish', emoji: '🐠', bucket: 'fish' },
  { name: 'pufferfish', emoji: '🐡', bucket: 'fish' },
  { name: 'shark', emoji: '🦈', bucket: 'fish' },
  { name: 'duck', emoji: '🦆', bucket: 'birds' },
  { name: 'owl', emoji: '🦉', bucket: 'birds' },
  { name: 'eagle', emoji: '🦅', bucket: 'birds' },
  { name: 'parrot', emoji: '🦜', bucket: 'birds' },
  { name: 'chicken', emoji: '🐔', bucket: 'birds' },
  { name: 'swan', emoji: '🦢', bucket: 'birds' },
  { name: 'dove', emoji: '🕊️', bucket: 'birds' },
  { name: 'peacock', emoji: '🦚', bucket: 'birds' },
  { name: 'flamingo', emoji: '🦩', bucket: 'birds' },
  { name: 'lizard', emoji: '🦎', bucket: 'reptiles' },
  { name: 'turtle', emoji: '🐢', bucket: 'reptiles' },
  { name: 'crocodile', emoji: '🐊', bucket: 'reptiles' },
]

/** The whale, dolphin, seal and bat are the catches: each looks like it belongs in another bucket. The turtle looks like a sea animal but is a reptile. */
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
  { name: 'mosquito', emoji: '🦟', bucket: 'insects' },
  { name: 'beetle', emoji: '🪲', bucket: 'insects' },
  { name: 'turtle', emoji: '🐢', bucket: 'reptiles' },
  { name: 'crocodile', emoji: '🐊', bucket: 'reptiles' },
  { name: 'lizard', emoji: '🦎', bucket: 'reptiles' },
]

export const LEVELS: Record<Difficulty, Level> = {
  easy: { buckets: BUCKETS, items: ITEMS },
  medium: { buckets: [MAMMALS, FISH, BIRDS, REPTILES], items: MEDIUM_ITEMS },
  hard: { buckets: [MAMMALS, BIRDS, FISH, INSECTS, REPTILES], items: HARD_ITEMS },
}
