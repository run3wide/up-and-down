export interface Choice {
  readonly name: string
  readonly emoji: string
  /** What the cake preview paints with this choice (unused by shapes and toppings). */
  readonly colour: string
}

export type Step = 'shape' | 'flavour' | 'frosting' | 'topping'

export const STEPS: readonly Step[] = ['shape', 'flavour', 'frosting', 'topping']

export const SHAPES: readonly Choice[] = [
  { name: 'Dinosaur', emoji: '🦖', colour: '#7bc96f' },
  { name: 'Strawberry', emoji: '🍓', colour: '#ff6b81' },
  { name: 'Race car', emoji: '🏎️', colour: '#ff5252' },
  { name: 'Fish', emoji: '🐟', colour: '#4dabf7' },
  { name: 'Shark', emoji: '🦈', colour: '#74a7c9' },
  { name: 'Tiger', emoji: '🐯', colour: '#ffa94d' },
]

export const FLAVOURS: readonly Choice[] = [
  { name: 'Strawberry', emoji: '🍓', colour: '#ffb3c1' },
  { name: 'Chocolate', emoji: '🍫', colour: '#8d5a3b' },
  { name: 'Carrot', emoji: '🥕', colour: '#f2a65a' },
  { name: 'Orange', emoji: '🍊', colour: '#ffc078' },
  { name: 'Vanilla', emoji: '🍦', colour: '#fff1c1' },
  { name: 'Pumpkin', emoji: '🎃', colour: '#e8923a' },
]

export const FROSTINGS: readonly Choice[] = [
  { name: 'Vanilla', emoji: '🍦', colour: '#fffaf0' },
  { name: 'Strawberry', emoji: '🍓', colour: '#ff9eb5' },
  { name: 'Chocolate', emoji: '🍫', colour: '#6b4226' },
  { name: 'Raspberry', emoji: '🫐', colour: '#d6336c' },
  { name: 'Lemon', emoji: '🍋', colour: '#fff176' },
]

/** Look-alike treats, not brands: the games never name real products. */
export const TOPPINGS: readonly Choice[] = [
  { name: 'Peanut butter cups', emoji: '🥜', colour: '#c68642' },
  { name: 'Chocolate cookies', emoji: '🍪', colour: '#3d2b1f' },
  { name: 'Candy buttons', emoji: '🍬', colour: '#ff6b6b' },
  { name: 'Caramel bars', emoji: '🍫', colour: '#a9713a' },
  { name: 'Sprinkles', emoji: '✨', colour: '#ffd43b' },
]

export const CHOICES: Readonly<Record<Step, readonly Choice[]>> = {
  shape: SHAPES,
  flavour: FLAVOURS,
  frosting: FROSTINGS,
  topping: TOPPINGS,
}
