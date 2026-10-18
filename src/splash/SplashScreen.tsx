import { useEffect, useRef } from 'react'
import { RaceCar } from '../art/RaceCar'
import { StrawberryIcon } from '../art/StrawberryIcon'
import type { GameId } from './games'
import { Logo } from './Logo'
import { SplashScene } from './SplashScene'
import './splash.css'

export function SplashScreen({ onPick }: { onPick: (game: GameId) => void }) {
  const firstGame = useRef<HTMLButtonElement>(null)
  useEffect(() => firstGame.current?.focus(), [])

  return (
    <main className="splash">
      <SplashScene />
      <div className="splash__content">
        <h1 className="splash__title">Pick a game</h1>
        <div className="game-cards">
          <button ref={firstGame} className="game-card game-card--up-and-down" aria-label="Play Up and Down, by Daniel" onClick={() => onPick('up-and-down')}>
            <Logo as="span" />
            <span className="game-card__byline">by Daniel</span>
          </button>
          <button className="game-card game-card--lemon-volcano" aria-label="Play Lemon Volcano, by Moses" onClick={() => onPick('lemon-volcano')}>
            <StrawberryIcon />
            <span className="game-card__title" aria-hidden="true">Lemon Volcano</span>
            <span className="game-card__byline">by Moses</span>
          </button>
          <button className="game-card game-card--dino-race" aria-label="Play Dino Race, by Daniel" onClick={() => onPick('dino-race')}>
            <RaceCar className="race-car-icon" />
            <span className="game-card__title game-card__title--dino" aria-hidden="true">Dino Race</span>
            <span className="game-card__byline">by Daniel</span>
          </button>
          <button className="game-card game-card--little-chef" aria-label="Play Little Chef, by Vanessa" onClick={() => onPick('little-chef')}>
            <span className="chef-icon" aria-hidden="true">🍕</span>
            <span className="game-card__title game-card__title--chef" aria-hidden="true">Little Chef</span>
            <span className="game-card__byline">by Vanessa</span>
          </button>
        </div>
      </div>
    </main>
  )
}
