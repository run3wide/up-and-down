import { useCallback, useEffect, useState } from 'react'
import { recordFinalScore, type BestScoreStore } from '../../shared/bestScore'
import { FrameControls } from '../../shared/frame/FrameControls'
import { Overlay, PausedOverlay } from '../../shared/Overlays'
import type { Quiz } from '../../dino-race/domain/quiz'
import { BakeGame, type BakeEvent, type Cake } from '../domain/bakeGame'
import type { Step } from '../domain/ingredients'
import '../../shared/hud.css'
import './bakery.css'

const NUH_UH_MS: number = 600
const INTRO = 'Solve the sum to unlock your choices!'

const STEP_TITLES: Record<Step, string> = {
  shape: 'Pick a shape',
  flavour: 'Pick a flavour',
  frosting: 'Pick a frosting',
  topping: 'Pick a topping',
}

interface BakeryScreenProps {
  createQuiz: () => Quiz
  bestScores: BestScoreStore
  onExit: () => void
}

export function BakeryScreen({ createQuiz, bestScores, onExit }: BakeryScreenProps) {
  const [game] = useState(() => new BakeGame(createQuiz()))
  const [snapshot, setSnapshot] = useState(() => game.snapshot())
  const [best, setBest] = useState(() => bestScores.load())
  const [message, setMessage] = useState(INTRO)
  const [shaking, setShaking] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)

  const react = useCallback(
    (events: BakeEvent[]) => {
      for (const event of events) {
        if (event.type === 'answeredRight') setMessage(`Yes! ${event.explanation}`)
        if (event.type === 'wrongAnswer') {
          setShaking(event.option)
          setMessage('Not quite - have another go!')
        }
        if (event.type === 'chosen') setMessage(`${event.choice.name}! ${event.choice.emoji}`)
        if (event.type === 'cakeBaked') setBest(recordFinalScore(bestScores, game.snapshot().cakesBaked).best)
      }
    },
    [bestScores, game],
  )

  const act = (events: BakeEvent[]) => {
    react(events)
    setSnapshot(game.snapshot())
  }

  useEffect(() => {
    if (shaking === null) return
    const timer = setTimeout(() => setShaking(null), NUH_UH_MS)
    return () => clearTimeout(timer)
  }, [shaking])

  const bakeAnother = () => {
    game.nextCake()
    setSnapshot(game.snapshot())
    setMessage(INTRO)
  }

  const { phase, step, question, wrongOptions, choices, cake } = snapshot

  return (
    <main className="bakery">
      <header className="hud">
        <p className="hud__score" role="note">
          Best: {best}
        </p>
        <p className="hud__score" role="status">
          Cakes: {snapshot.cakesBaked}
        </p>
      </header>
      <FrameControls pause={{ paused, onPause: () => setPaused(true) }} />
      {phase !== 'baked' && <CakePreview cake={cake} />}
      <h1 className="bakery__step">{phase === 'baked' ? 'Yum!' : STEP_TITLES[step]}</h1>
      {phase === 'question' && (
        <section className="bakery__question" aria-label="Sum">
          <p className="bakery__prompt">{question.prompt}</p>
          <div className="bakery__answers" role="group" aria-label="Answers">
            {question.options.map((option, index) => (
              <button
                key={option}
                className={`bakery__answer${index === shaking ? ' bakery__answer--nuh-uh' : ''}`}
                disabled={paused || wrongOptions.includes(index)}
                onClick={() => act(game.answer(index))}
              >
                {option}
              </button>
            ))}
          </div>
        </section>
      )}
      <p className="bakery__message" role="alert">
        {message}
      </p>
      {phase === 'choosing' && (
        <div className="bakery__choices" role="group" aria-label="Choices">
          {choices.map((choice) => (
            <button key={choice.name} className="bakery__choice" aria-label={choice.name} disabled={paused} onClick={() => act(game.choose(choice.name))}>
              <span className="bakery__choice-picture" aria-hidden="true">
                {choice.emoji}
              </span>
              <span aria-hidden="true">{choice.name}</span>
            </button>
          ))}
        </div>
      )}
      {paused && <PausedOverlay onResume={() => setPaused(false)} onMainMenu={onExit} />}
      {phase === 'baked' && !paused && (
        <Overlay title="Your cake is ready!">
          <CakePreview cake={cake} />
          <button className="big-button" autoFocus onClick={bakeAnother}>
            Bake another cake
          </button>
        </Overlay>
      )}
    </main>
  )
}

function CakePreview({ cake }: { cake: Cake }) {
  const { shape, flavour, frosting, topping } = cake
  return (
    <div className="bakery__cake" role="img" aria-label={describe(cake)}>
      <div className="bakery__toppings" aria-hidden="true">
        {topping ? Array.from({ length: 5 }, (_, i) => <span key={i}>{topping.emoji}</span>) : null}
      </div>
      <div className="bakery__frosting" aria-hidden="true" style={{ background: frosting?.colour }} data-empty={frosting ? undefined : ''} />
      <div className="bakery__mould" aria-hidden="true" style={{ background: flavour?.colour }} data-empty={flavour ? undefined : ''}>
        {shape?.emoji ?? '🎂'}
      </div>
    </div>
  )
}

function describe({ shape, flavour, frosting, topping }: Cake): string {
  if (shape && flavour && frosting && topping) {
    return `A ${shape.name} cake: ${flavour.name} cake, ${frosting.name} frosting and ${topping.name} on top`
  }
  const soFar = [shape?.name, flavour && `${flavour.name} cake`, frosting && `${frosting.name} frosting`].filter(Boolean)
  return soFar.length === 0 ? 'Your cake is empty so far' : `Your cake so far: ${soFar.join(', ')}`
}
