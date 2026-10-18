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
