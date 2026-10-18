import { launchBall, stepBall, type Ball } from './ball'
import { judgeBall } from './catching'
import { difficultyFor } from './difficulty'
import { WORLD_WIDTH } from './world'

export const MAX_LIVES = 3
export const INTERMISSION = 0.8
const DINO_SPEED = 70
const DINO_MARGIN = 8
const LAUNCH_MARGIN = 10

export type Random = () => number
export type Direction = 'left' | 'right'
export type Phase = 'playing' | 'paused' | 'over'
export type GameEvent = { type: 'caught' } | { type: 'missed' } | { type: 'gameOver' }

export interface GameSnapshot {
  readonly phase: Phase
  readonly score: number
  readonly lives: number
  readonly dinoX: number
  readonly ball: Ball | null
}

export class Game {
  private phase: Phase = 'playing'
  private score = 0
  private lives = MAX_LIVES
  private dinoX = WORLD_WIDTH / 2
  private ball: Ball | null = null
  private untilNextBall = INTERMISSION

  private readonly random: Random

  constructor(random: Random) {
    this.random = random
  }

  snapshot(): GameSnapshot {
    return { phase: this.phase, score: this.score, lives: this.lives, dinoX: this.dinoX, ball: this.ball }
  }

  moveDino(direction: Direction, dt: number): void {
    const sign = direction === 'left' ? -1 : 1
    this.placeDino(this.dinoX + sign * DINO_SPEED * dt)
  }

  placeDino(x: number): void {
    if (this.phase !== 'playing') return
    this.dinoX = Math.min(Math.max(x, DINO_MARGIN), WORLD_WIDTH - DINO_MARGIN)
  }

  tick(dt: number): GameEvent[] {
    if (this.phase !== 'playing') return []
    if (this.ball === null) return this.waitForNextBall(dt)
    return this.flyBall(this.ball, dt)
  }

  pause(): void {
    if (this.phase === 'playing') this.phase = 'paused'
  }

  resume(): void {
    if (this.phase === 'paused') this.phase = 'playing'
  }

  togglePause(): void {
    if (this.phase === 'paused') this.resume()
    else this.pause()
  }

  private waitForNextBall(dt: number): GameEvent[] {
    this.untilNextBall -= dt
    if (this.untilNextBall <= 0) this.ball = this.throwBall()
    return []
  }

  private throwBall(): Ball {
    const { launchSpeed, maxDrift } = difficultyFor(this.score)
    return launchBall({
      x: LAUNCH_MARGIN + this.random() * (WORLD_WIDTH - 2 * LAUNCH_MARGIN),
      vx: (this.random() * 2 - 1) * maxDrift,
      vy: launchSpeed,
    })
  }

  private flyBall(ball: Ball, dt: number): GameEvent[] {
    const moved = stepBall(ball, dt)
    const verdict = judgeBall(moved, this.dinoX)
    if (verdict === 'inPlay') {
      this.ball = moved
      return []
    }
    this.endRound()
    return verdict === 'caught' ? this.catchBall() : this.missBall()
  }

  private endRound(): void {
    this.ball = null
    this.untilNextBall = INTERMISSION
  }

  private catchBall(): GameEvent[] {
    this.score += 1
    return [{ type: 'caught' }]
  }

  private missBall(): GameEvent[] {
    this.lives -= 1
    if (this.lives > 0) return [{ type: 'missed' }]
    this.phase = 'over'
    return [{ type: 'missed' }, { type: 'gameOver' }]
  }
}
