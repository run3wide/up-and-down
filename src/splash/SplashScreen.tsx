import { useEffect, useRef } from 'react'
import { RobotIcon } from '../art/RobotIcon'
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
          <button ref={firstGame} className="game-card game-card--up-and-down" aria-label="Play Up and Down, by Daniel Robson" onClick={() => onPick('up-and-down')}>
            <Logo as="span" />
            <span className="game-card__byline">by Daniel Robson</span>
          </button>
          <button className="game-card game-card--robot-hoops" aria-label="Play Robot Hoops, by Moses Robson" onClick={() => onPick('robot-hoops')}>
            <RobotIcon />
            <span className="game-card__title" aria-hidden="true">Robot Hoops</span>
            <span className="game-card__byline">by Moses Robson</span>
          </button>
        </div>
      </div>
    </main>
  )
}
