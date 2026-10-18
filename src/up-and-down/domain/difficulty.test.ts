import { describe, expect, it } from 'vitest'
import { difficultyFor } from './difficulty'

describe('difficulty', () => {
  it('gets faster as the score rises', () => {
    expect(difficultyFor(10).launchSpeed).toBeGreaterThan(difficultyFor(0).launchSpeed)
  })

  it('allows more sideways drift as the score rises', () => {
    expect(difficultyFor(10).maxDrift).toBeGreaterThan(difficultyFor(0).maxDrift)
  })

  it('stops ramping up so the game stays fair', () => {
    expect(difficultyFor(500)).toEqual(difficultyFor(5000))
  })

  it('starts gentle', () => {
    expect(difficultyFor(0).maxDrift).toBeLessThanOrEqual(10)
  })
})
