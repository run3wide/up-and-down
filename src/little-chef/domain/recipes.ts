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
const bread = { name: 'Bread', emoji: '🍞' }
const carrot = { name: 'Carrot', emoji: '🥕' }
const butter = { name: 'Butter', emoji: '🧈' }
const honey = { name: 'Honey', emoji: '🍯' }
const chocolate = { name: 'Chocolate', emoji: '🍫' }

export const RECIPES: readonly Recipe[] = [
  { dish: 'Pizza', emoji: '🍕', flavour: 'savoury', ingredients: [tomato, cheese, { name: 'Pepperoni', emoji: '🔴' }, { name: 'Mushroom', emoji: '🍄' }] },
  { dish: 'Burger', emoji: '🍔', flavour: 'savoury', ingredients: [{ name: 'Bun', emoji: '🥯' }, { name: 'Patty', emoji: '🥩' }, cheese, lettuce, tomato] },
  { dish: 'Salad', emoji: '🥗', flavour: 'savoury', ingredients: [lettuce, { name: 'Cucumber', emoji: '🥒' }, carrot, tomato] },
  { dish: 'Fruit salad', emoji: '🍉', flavour: 'sweet', ingredients: [{ name: 'Apple', emoji: '🍎' }, banana, { name: 'Grapes', emoji: '🍇' }, { name: 'Orange', emoji: '🍊' }] },
  { dish: 'Sundae', emoji: '🍨', flavour: 'sweet', ingredients: [{ name: 'Ice cream', emoji: '🍦' }, chocolate, { name: 'Cherry', emoji: '🍒' }, { name: 'Sprinkles', emoji: '🌈' }] },
  { dish: 'Smoothie', emoji: '🥤', flavour: 'sweet', ingredients: [banana, strawberry, { name: 'Milk', emoji: '🥛' }, honey] },
  { dish: 'Taco', emoji: '🌮', flavour: 'savoury', ingredients: [{ name: 'Tortilla', emoji: '🫓' }, { name: 'Beans', emoji: '🫘' }, cheese, lettuce, tomato] },
  { dish: 'Sandwich', emoji: '🥪', flavour: 'savoury', ingredients: [bread, { name: 'Bacon', emoji: '🥓' }, cheese, lettuce, tomato] },
  { dish: 'Spaghetti', emoji: '🍝', flavour: 'savoury', ingredients: [{ name: 'Pasta', emoji: '🍜' }, tomato, cheese, { name: 'Basil', emoji: '🌿' }] },
  { dish: 'Soup', emoji: '🍲', flavour: 'savoury', ingredients: [carrot, { name: 'Potato', emoji: '🥔' }, { name: 'Onion', emoji: '🧅' }, { name: 'Corn', emoji: '🌽' }] },
  { dish: 'Pancakes', emoji: '🥞', flavour: 'sweet', ingredients: [{ name: 'Blueberries', emoji: '🫐' }, banana, butter, honey] },
  { dish: 'Cookies', emoji: '🍪', flavour: 'sweet', ingredients: [chocolate, butter, { name: 'Peanuts', emoji: '🥜' }, honey] },
]
