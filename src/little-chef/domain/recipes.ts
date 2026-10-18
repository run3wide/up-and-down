export interface Ingredient {
  readonly name: string
  readonly emoji: string
}

/** Savoury and sweet ingredients never mix, so anything from the other flavour is clearly wrong for a dish. */
export type Flavour = 'savoury' | 'sweet'

export interface Recipe {
  readonly dish: string
  readonly emoji: string
  readonly flavour: Flavour
  readonly ingredients: readonly Ingredient[]
}

const tomato = { name: 'Tomato', emoji: '🍅' }
const cheese = { name: 'Cheese', emoji: '🧀' }
const lettuce = { name: 'Lettuce', emoji: '🥬' }
const banana = { name: 'Banana', emoji: '🍌' }
const strawberry = { name: 'Strawberry', emoji: '🍓' }

export const RECIPES: readonly Recipe[] = [
  { dish: 'Pizza', emoji: '🍕', flavour: 'savoury', ingredients: [tomato, cheese, { name: 'Pepperoni', emoji: '🔴' }, { name: 'Mushroom', emoji: '🍄' }] },
  { dish: 'Burger', emoji: '🍔', flavour: 'savoury', ingredients: [{ name: 'Bun', emoji: '🍞' }, { name: 'Patty', emoji: '🥩' }, cheese, lettuce, tomato] },
  { dish: 'Salad', emoji: '🥗', flavour: 'savoury', ingredients: [lettuce, { name: 'Cucumber', emoji: '🥒' }, { name: 'Carrot', emoji: '🥕' }, tomato] },
  { dish: 'Fruit salad', emoji: '🍉', flavour: 'sweet', ingredients: [{ name: 'Apple', emoji: '🍎' }, banana, { name: 'Grapes', emoji: '🍇' }, { name: 'Orange', emoji: '🍊' }] },
  { dish: 'Sundae', emoji: '🍨', flavour: 'sweet', ingredients: [{ name: 'Ice cream', emoji: '🍦' }, { name: 'Chocolate', emoji: '🍫' }, { name: 'Cherry', emoji: '🍒' }, { name: 'Sprinkles', emoji: '🌈' }] },
  { dish: 'Smoothie', emoji: '🥤', flavour: 'sweet', ingredients: [banana, strawberry, { name: 'Milk', emoji: '🥛' }, { name: 'Honey', emoji: '🍯' }] },
]
