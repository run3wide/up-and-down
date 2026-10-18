import { useCallback, useState } from 'react'
import { FrameControls } from '../../shared/frame/FrameControls'
import { recordFinalScore, type BestScoreResult, type BestScoreStore } from '../../shared/bestScore'
import { Hearts } from '../../shared/Hearts'
import { GameOverOverlay, PausedOverlay } from '../../shared/Overlays'
import { KitchenGame, MAX_LIVES, type KitchenEvent } from '../domain/kitchenGame'
import { RECIPES } from '../domain/recipes'
import '../../shared/hud.css'
import './kitchen.css'

interface KitchenScreenProps {
  random: () => number
  bestScores: BestScoreStore
  onExit: () => void
}

export function KitchenScreen({ random, bestScores, onExit }: KitchenScreenProps) {
  const [game] = useState(() => new KitchenGame(RECIPES, random))
  const [snapshot, setSnapshot] = useState(() => game.snapshot())
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<BestScoreResult | null>(null)
  const [paused, setPaused] = useState(false)

  const react = useCallback(
    (events: KitchenEvent[]) => {
      for (const event of events) {
        if (event.type === 'ingredientAdded') setMessage('')
        if (event.type === 'wrongIngredient') setMessage(`Not ${event.ingredient}! That doesn't go in our ${event.dish.toLowerCase()}.`)
        if (event.type === 'dishCooked') setMessage(`Yum! Your ${event.dish.toLowerCase()} is ready! ${event.emoji}`)
        if (event.type === 'gameOver') setResult(recordFinalScore(bestScores, game.snapshot().dishesCooked))
      }
    },
    [bestScores, game],
  )

  const pick = (name: string) => {
    react(game.pick(name))
    setSnapshot(game.snapshot())
  }

  const inTheDish = snapshot.shelf.filter((item) => item.state === 'added')
  const stillNeeded = snapshot.needed - snapshot.added
  return (
    <main className="kitchen">
      <header className="hud">
        <Hearts lives={snapshot.lives} max={MAX_LIVES} />
        <p className="hud__score" role="status">
          Score: {snapshot.dishesCooked}
        </p>
      </header>
      <FrameControls pause={{ paused, onPause: () => setPaused(true) }} />
      <section className="kitchen__order">
        <p className="kitchen__order-label">Order up!</p>
        <h1 key={snapshot.dish} className="kitchen__dish-name">
          {snapshot.dish}
        </h1>
        <span className="kitchen__dish-emoji" aria-hidden="true">
          {snapshot.dishEmoji}
        </span>
      </section>
      <div className="kitchen__plate">
        {inTheDish.map((item) => (
          <span key={item.name} className="kitchen__in-dish" role="img" aria-label={`In the dish: ${item.name}`}>
            {item.emoji}
          </span>
        ))}
        {Array.from({ length: stillNeeded }, (_, i) => (
          <span key={i} className="kitchen__empty-spot" aria-hidden="true" />
        ))}
      </div>
      <p className="kitchen__message" role="alert">
        {message}
      </p>
      <div className="kitchen__shelf" role="group" aria-label="Ingredients">
        {snapshot.shelf.map((item) => (
          <button
            key={item.name}
            className={`ingredient ingredient--${item.state}`}
            disabled={item.state !== 'available' || paused}
            onClick={() => pick(item.name)}
          >
            <span className="ingredient__emoji" aria-hidden="true">
              {item.emoji}
            </span>
            {item.name}
          </button>
        ))}
      </div>
      {paused && <PausedOverlay onResume={() => setPaused(false)} onMainMenu={onExit} />}
      {snapshot.phase === 'over' && result && (
        <GameOverOverlay title="Kitchen closed!" score={snapshot.dishesCooked} result={result} onBackToGames={onExit} />
      )}
    </main>
  )
}
