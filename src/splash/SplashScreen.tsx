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
          <button className="game-card game-card--match-up" aria-label="Play Match Up, by Daniel" onClick={() => onPick('match-up')}>
            <span className="match-icon" aria-hidden="true">🍎🐱</span>
            <span className="game-card__title game-card__title--match" aria-hidden="true">Match Up</span>
            <span className="game-card__byline">by Daniel</span>
          </button>
          <button className="game-card game-card--cookie-maze" aria-label="Play Cookie Maze, by Daniel" onClick={() => onPick('cookie-maze')}>
            <span className="maze-icon" aria-hidden="true">🦖🍪</span>
            <span className="game-card__title game-card__title--maze" aria-hidden="true">Cookie Maze</span>
            <span className="game-card__byline">by Daniel</span>
          </button>
          <button className="game-card game-card--tic-tac-toe" aria-label="Play Tic Tac Toe, by Daniel" onClick={() => onPick('tic-tac-toe')}>
            <span className="match-icon" aria-hidden="true">❌⭕</span>
            <span className="game-card__title game-card__title--tic-tac-toe" aria-hidden="true">Tic Tac Toe</span>
            <span className="game-card__byline">by Daniel</span>
          </button>
          <button className="game-card game-card--spelling-bee" aria-label="Play Spelling Bee, by Daniel" onClick={() => onPick('spelling-bee')}>
            <span className="match-icon" aria-hidden="true">🐱🔤</span>
            <span className="game-card__title game-card__title--spelling-bee" aria-hidden="true">Spelling Bee</span>
            <span className="game-card__byline">by Daniel</span>
          </button>
          <button className="game-card game-card--dino-dig" aria-label="Play Dino Dig, by Moses" onClick={() => onPick('dino-dig')}>
            <span className="match-icon" aria-hidden="true">🦴🦖</span>
            <span className="game-card__title game-card__title--dino-dig" aria-hidden="true">Dino Dig</span>
            <span className="game-card__byline">by Moses</span>
          </button>
          <button className="game-card game-card--colouring" aria-label="Play Colouring, by Moses" onClick={() => onPick('colouring')}>
            <span className="match-icon" aria-hidden="true">🎨🦖</span>
            <span className="game-card__title game-card__title--colouring" aria-hidden="true">Colouring</span>
            <span className="game-card__byline">by Moses</span>
          </button>
          <button className="game-card game-card--bucket" aria-label="Play Put It In The Bucket, by Moses" onClick={() => onPick('put-it-in-the-bucket')}>
            <span className="match-icon" aria-hidden="true">🐮🪣</span>
            <span className="game-card__title game-card__title--bucket" aria-hidden="true">Put It In The Bucket</span>
            <span className="game-card__byline">by Moses</span>
          </button>
          <button className="game-card game-card--brick-builder" aria-label="Play Brick Builder, by Moses" onClick={() => onPick('brick-builder')}>
            <span className="match-icon" aria-hidden="true">🧱🏗️</span>
            <span className="game-card__title game-card__title--brick-builder" aria-hidden="true">Brick Builder</span>
            <span className="game-card__byline">by Moses</span>
          </button>
          <button className="game-card game-card--treasure-map" aria-label="Play Treasure Map" onClick={() => onPick('treasure-map')}>
            <span className="match-icon" aria-hidden="true">🗺️🦜</span>
            <span className="game-card__title game-card__title--treasure-map" aria-hidden="true">Treasure Map</span>
          </button>
        </div>
      </div>
    </main>
  )
}
