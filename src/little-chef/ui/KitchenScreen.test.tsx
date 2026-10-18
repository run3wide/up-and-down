import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InMemoryBestScoreStore } from '../../shared/InMemoryBestScoreStore'
import { RECIPES } from '../domain/recipes'
import { KitchenScreen } from './KitchenScreen'

/** With every random value at 0 the first order is the first recipe: a pizza. */
const alwaysFirstRecipe = () => 0

function renderKitchen(bestScore = 0) {
  const bestScores = new InMemoryBestScoreStore(bestScore)
  const onExit = vi.fn()
  render(<KitchenScreen random={alwaysFirstRecipe} bestScores={bestScores} onExit={onExit} />)
  return { bestScores, onExit }
}

const shelf = () => within(screen.getByRole('group', { name: 'Ingredients' }))
const ingredient = (name: string) => shelf().getByRole('button', { name })
const currentDish = () => RECIPES.find((recipe) => recipe.dish === screen.getByRole('heading', { level: 1 }).textContent)!

function pick(name: string) {
  fireEvent.click(ingredient(name))
}

function cookCurrentDish() {
  for (const { name } of currentDish().ingredients) pick(name)
}

function pickSomethingThatDoesNotBelong() {
  const dish = currentDish()
  const wrong = shelf()
    .getAllByRole('button')
    .find((button) => !button.hasAttribute('disabled') && !dish.ingredients.some((own) => button.textContent?.includes(own.name)))!
  fireEvent.click(wrong)
}

describe('KitchenScreen', () => {
  it('asks for a dish and offers its ingredients along with others that do not belong', () => {
    renderKitchen()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Pizza')
    for (const name of ['Tomato', 'Cheese', 'Pepperoni']) expect(ingredient(name)).toBeEnabled()
    expect(shelf().getAllByRole('button').length).toBeGreaterThan(currentDish().ingredients.length)
    expect(screen.getByRole('status')).toHaveTextContent('Score: 0')
    expect(screen.getByRole('img', { name: '3 lives left' })).toBeInTheDocument()
  })

  it('puts a right ingredient into the dish', () => {
    renderKitchen()

    pick('Tomato')

    expect(ingredient('Tomato')).toBeDisabled()
    expect(screen.getByRole('img', { name: '3 lives left' })).toBeInTheDocument()
    expect(screen.getByLabelText('In the dish: Tomato')).toBeInTheDocument()
  })

  it('gently says no to something that does not belong, and takes a heart', () => {
    renderKitchen()

    pickSomethingThatDoesNotBelong()

    expect(screen.getByRole('img', { name: '2 lives left' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(/doesn't go in our pizza/i)
  })

  it('scores a finished dish, praises the cook and moves on to the next order', () => {
    renderKitchen()

    cookCurrentDish()

    expect(screen.getByRole('status')).toHaveTextContent('Score: 1')
    expect(screen.getByRole('alert')).toHaveTextContent(/pizza is ready/i)
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveTextContent('Pizza')
  })

  it('ends when the hearts run out and remembers the best score', () => {
    const { bestScores } = renderKitchen()

    cookCurrentDish()
    cookCurrentDish()
    pickSomethingThatDoesNotBelong()
    pickSomethingThatDoesNotBelong()
    pickSomethingThatDoesNotBelong()

    const gameOver = screen.getByRole('dialog', { name: 'Kitchen closed!' })
    expect(gameOver).toHaveTextContent('Score: 2')
    expect(bestScores.load()).toBe(2)
  })

  it('can be paused, and goes back to the games from there', () => {
    const { onExit } = renderKitchen()

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(screen.getByRole('dialog', { name: 'Paused' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    fireEvent.click(screen.getByRole('button', { name: 'Main menu' }))
    expect(onExit).toHaveBeenCalledOnce()
  })
})
