import type { Ingredient, Recipe } from './recipes'

export const MAX_LIVES = 3

const FIRST_WRONG_INGREDIENTS = 2
const MOST_WRONG_INGREDIENTS = 4
const DISHES_PER_EXTRA_WRONG_INGREDIENT = 2

export type Phase = 'cooking' | 'over'
export type ShelfState = 'available' | 'added' | 'rejected'

export type KitchenEvent =
  | { type: 'ingredientAdded'; ingredient: string }
  | { type: 'wrongIngredient'; ingredient: string; dish: string }
  | { type: 'dishCooked'; dish: string; emoji: string }
  | { type: 'gameOver' }

export interface ShelfItem extends Ingredient {
  readonly state: ShelfState
}

export interface KitchenSnapshot {
  readonly phase: Phase
  readonly dish: string
  readonly dishEmoji: string
  readonly lives: number
  readonly dishesCooked: number
  readonly needed: number
  readonly added: number
  readonly shelf: readonly ShelfItem[]
}

interface Order {
  readonly recipe: Recipe
  readonly shelf: readonly Ingredient[]
}

export class KitchenGame {
  private readonly recipes: readonly Recipe[]
  private readonly random: () => number
  private lives = MAX_LIVES
  private dishesCooked = 0
  private order: Order
  private deck: Recipe[] = []
  private added = new Set<string>()
  private rejected = new Set<string>()

  constructor(recipes: readonly Recipe[], random: () => number) {
    this.recipes = recipes
    this.random = random
    this.order = this.takeOrder()
  }

  pick(name: string): KitchenEvent[] {
    if (this.lives === 0 || !this.isAvailable(name)) return []
    return this.isNeeded(name) ? this.addIngredient(name) : this.rejectIngredient(name)
  }

  snapshot(): KitchenSnapshot {
    const { recipe, shelf } = this.order
    return {
      phase: this.lives === 0 ? 'over' : 'cooking',
      dish: recipe.dish,
      dishEmoji: recipe.emoji,
      lives: this.lives,
      dishesCooked: this.dishesCooked,
      needed: recipe.ingredients.length,
      added: this.added.size,
      shelf: shelf.map((ingredient) => ({ ...ingredient, state: this.stateOf(ingredient.name) })),
    }
  }

  private addIngredient(name: string): KitchenEvent[] {
    this.added.add(name)
    const events: KitchenEvent[] = [{ type: 'ingredientAdded', ingredient: name }]
    if (this.added.size === this.order.recipe.ingredients.length) events.push(this.finishDish())
    return events
  }

  private rejectIngredient(name: string): KitchenEvent[] {
    this.rejected.add(name)
    this.lives -= 1
    const events: KitchenEvent[] = [{ type: 'wrongIngredient', ingredient: name, dish: this.order.recipe.dish }]
    if (this.lives === 0) events.push({ type: 'gameOver' })
    return events
  }

  private finishDish(): KitchenEvent {
    const { dish, emoji } = this.order.recipe
    this.dishesCooked += 1
    this.order = this.takeOrder()
    return { type: 'dishCooked', dish, emoji }
  }

  private takeOrder(): Order {
    const recipe = this.nextRecipe()
    this.added = new Set()
    this.rejected = new Set()
    return { recipe, shelf: this.shuffled([...recipe.ingredients, ...this.wrongIngredientsFor(recipe)]) }
  }

  /** A shuffled deck, so every dish is served once before any comes round again. */
  private nextRecipe(): Recipe {
    if (this.deck.length === 0) this.deck = this.freshDeck()
    return this.deck.shift()!
  }

  private freshDeck(): Recipe[] {
    const deck = this.shuffled(this.recipes)
    const justCooked = this.order?.recipe
    if (deck.length > 1 && deck[0] === justCooked) deck.push(deck.shift()!)
    return deck
  }

  private wrongIngredientsFor(recipe: Recipe): Ingredient[] {
    const wrongOnes = new Map<string, Ingredient>()
    for (const other of this.recipes) {
      if (other.flavour === recipe.flavour) continue
      for (const ingredient of other.ingredients) wrongOnes.set(ingredient.name, ingredient)
    }
    const own = new Set(recipe.ingredients.map((ingredient) => ingredient.name))
    const candidates = [...wrongOnes.values()].filter((ingredient) => !own.has(ingredient.name))
    return this.shuffled(candidates).slice(0, this.wrongIngredientCount())
  }

  private wrongIngredientCount(): number {
    const extra = Math.floor(this.dishesCooked / DISHES_PER_EXTRA_WRONG_INGREDIENT)
    return Math.min(FIRST_WRONG_INGREDIENTS + extra, MOST_WRONG_INGREDIENTS)
  }

  private shuffled<T>(items: readonly T[]): T[] {
    const result = [...items]
    for (let i = 0; i < result.length - 1; i++) {
      const j = i + Math.floor(this.random() * (result.length - i))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }

  private isAvailable(name: string): boolean {
    return this.order.shelf.some((ingredient) => ingredient.name === name) && this.stateOf(name) === 'available'
  }

  private isNeeded(name: string): boolean {
    return this.order.recipe.ingredients.some((ingredient) => ingredient.name === name)
  }

  private stateOf(name: string): ShelfState {
    if (this.added.has(name)) return 'added'
    return this.rejected.has(name) ? 'rejected' : 'available'
  }
}
