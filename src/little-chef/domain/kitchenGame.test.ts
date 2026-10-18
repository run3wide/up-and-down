import { describe, expect, it } from 'vitest'
import { KitchenGame, MAX_LIVES } from './kitchenGame'
import { type Ingredient, type Recipe, RECIPES } from './recipes'

const ingredient = (name: string): Ingredient => ({ name, emoji: '·' })

const pizza: Recipe = { dish: 'Pizza', emoji: '🍕', flavour: 'savoury', ingredients: [ingredient('Tomato'), ingredient('Cheese')] }
const smoothie: Recipe = { dish: 'Smoothie', emoji: '🥤', flavour: 'sweet', ingredients: [ingredient('Banana'), ingredient('Milk')] }
const burger: Recipe = { dish: 'Burger', emoji: '🍔', flavour: 'savoury', ingredients: [ingredient('Bun'), ingredient('Patty')] }

const firstRecipe = () => 0
const lastRecipe = () => 0.999

function shelfNames(game: KitchenGame) {
  return game.snapshot().shelf.map((item) => item.name)
}

function pickWrongOne(game: KitchenGame, recipes: readonly Recipe[]) {
  const { dish, shelf } = game.snapshot()
  const recipe = recipes.find((candidate) => candidate.dish === dish)!
  const wrong = shelf.find((item) => item.state === 'available' && !recipe.ingredients.some((own) => own.name === item.name))!
  return game.pick(wrong.name)
}

function cook(game: KitchenGame, recipes: readonly Recipe[]) {
  const { dish } = game.snapshot()
  const recipe = recipes.find((candidate) => candidate.dish === dish)!
  return recipe.ingredients.flatMap((own) => game.pick(own.name))
}

describe('KitchenGame', () => {
  it('starts with an order, full lives and nothing cooked', () => {
    const game = new KitchenGame([pizza, smoothie], firstRecipe)

    expect(game.snapshot()).toMatchObject({ phase: 'cooking', dish: 'Pizza', dishEmoji: '🍕', lives: MAX_LIVES, dishesCooked: 0, needed: 2, added: 0 })
  })

  it('puts every ingredient the dish needs on the shelf, with some that do not belong from the other flavour', () => {
    const game = new KitchenGame([pizza, smoothie], firstRecipe)

    const names = shelfNames(game)
    expect(names).toContain('Tomato')
    expect(names).toContain('Cheese')
    expect(names).toContain('Banana')
    expect(names).toContain('Milk')
  })

  it('never puts an ingredient of the dish among the ones that do not belong twice', () => {
    const game = new KitchenGame(RECIPES, firstRecipe)

    const names = shelfNames(game)
    expect(new Set(names).size).toBe(names.length)
  })

  it('adds a right ingredient to the dish', () => {
    const game = new KitchenGame([pizza, smoothie], firstRecipe)

    expect(game.pick('Tomato')).toEqual([{ type: 'ingredientAdded', ingredient: 'Tomato' }])

    expect(game.snapshot()).toMatchObject({ added: 1, lives: MAX_LIVES })
    expect(game.snapshot().shelf.find((item) => item.name === 'Tomato')?.state).toBe('added')
  })

  it('costs a life to pick something that does not belong, and marks it so it cannot cost another', () => {
    const game = new KitchenGame([pizza, smoothie], firstRecipe)

    expect(game.pick('Banana')).toEqual([{ type: 'wrongIngredient', ingredient: 'Banana', dish: 'Pizza' }])
    expect(game.pick('Banana')).toEqual([])

    expect(game.snapshot().lives).toBe(MAX_LIVES - 1)
    expect(game.snapshot().shelf.find((item) => item.name === 'Banana')?.state).toBe('rejected')
  })

  it('ignores the same right ingredient picked twice and things that are not on the shelf', () => {
    const game = new KitchenGame([pizza, smoothie], firstRecipe)
    game.pick('Tomato')

    expect(game.pick('Tomato')).toEqual([])
    expect(game.pick('Dragon fruit')).toEqual([])
    expect(game.snapshot()).toMatchObject({ added: 1, lives: MAX_LIVES })
  })

  it('scores a dish once every ingredient is in, then takes a different order', () => {
    const game = new KitchenGame([pizza, smoothie], firstRecipe)

    game.pick('Tomato')
    const events = game.pick('Cheese')

    expect(events).toEqual([{ type: 'ingredientAdded', ingredient: 'Cheese' }, { type: 'dishCooked', dish: 'Pizza', emoji: '🍕' }])
    expect(game.snapshot()).toMatchObject({ dish: 'Smoothie', dishesCooked: 1, added: 0 })
  })

  it('does not repeat the dish it just cooked when there is another', () => {
    const recipes = [pizza, smoothie, burger]
    const game = new KitchenGame(recipes, lastRecipe)

    for (let round = 0; round < 6; round++) {
      const before = game.snapshot().dish
      cook(game, recipes)
      expect(game.snapshot().dish).not.toBe(before)
    }
  })

  it('fills the shelf up gradually as more dishes are cooked, up to a limit', () => {
    const game = new KitchenGame(RECIPES, firstRecipe)
    const sizes: number[] = []

    for (let round = 0; round < 12; round++) {
      sizes.push(game.snapshot().shelf.length - game.snapshot().needed)
      cook(game, RECIPES)
    }

    expect(sizes[0]).toBeLessThan(sizes[11])
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b))
    expect(Math.max(...sizes)).toBeLessThanOrEqual(4)
  })

  it('is game over when the last life is gone, and then takes no more picks', () => {
    const game = new KitchenGame(RECIPES, firstRecipe)

    pickWrongOne(game, RECIPES)
    pickWrongOne(game, RECIPES)
    cook(game, RECIPES)
    const events = pickWrongOne(game, RECIPES)

    expect(events.at(-1)).toEqual({ type: 'gameOver' })
    expect(game.snapshot()).toMatchObject({ phase: 'over', lives: 0 })
    expect(game.pick(game.snapshot().shelf[0].name)).toEqual([])
  })

  it('shuffles the shelf with the random source it was given', () => {
    const first = shelfNames(new KitchenGame([pizza, smoothie], firstRecipe))
    const second = shelfNames(new KitchenGame([pizza, smoothie], lastRecipe))

    expect(new Set(first)).toEqual(new Set(shelfNames(new KitchenGame([pizza, smoothie], firstRecipe))))
    expect(first).not.toEqual(second)
  })
})

describe('RECIPES', () => {
  it('has savoury and sweet dishes, each with its own ingredients', () => {
    expect(new Set(RECIPES.map((recipe) => recipe.flavour))).toEqual(new Set(['savoury', 'sweet']))
    for (const recipe of RECIPES) expect(recipe.ingredients.length).toBeGreaterThanOrEqual(3)
  })

  it('gives a pizza tomatoes, cheese and pepperoni but never grapes or lettuce', () => {
    const names = RECIPES.find((recipe) => recipe.dish === 'Pizza')!.ingredients.map((own) => own.name)

    expect(names).toEqual(expect.arrayContaining(['Tomato', 'Cheese', 'Pepperoni']))
    expect(names).not.toContain('Grapes')
    expect(names).not.toContain('Lettuce')
  })
})
