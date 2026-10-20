import { useCallback, useEffect, useState } from 'react'
import { recordFinalScore, type BestScoreStore } from '../../shared/bestScore'
import { FrameControls } from '../../shared/frame/FrameControls'
import { Overlay, PausedOverlay } from '../../shared/Overlays'
import type { SoundPlayer } from '../../shared/sound/SoundPlayer'
import { DinoCluesGame, type CluesEvent } from '../domain/dinoCluesGame'
import { HIDING_PLACES, MYSTERIES } from '../domain/mysteries'
import '../../shared/hud.css'
import './dinoClues.css'

const NUH_UH_MS = 600
const CLUES_TO_FIND = 3
const INTRO = 'Tap the hiding places to look for 3 clues!'

interface DinoCluesScreenProps {
  random: () => number
  bestScores: BestScoreStore
  sound: SoundPlayer
  onExit: () => void
}

export function DinoCluesScreen({ random, bestScores, sound, onExit }: DinoCluesScreenProps) {
  const [game] = useState(() => new DinoCluesGame(MYSTERIES, HIDING_PLACES, random))
  const [snapshot, setSnapshot] = useState(() => game.snapshot())
  const [best, setBest] = useState(() => bestScores.load())
  const [message, setMessage] = useState(INTRO)
  const [wrongChoice, setWrongChoice] = useState<string | null>(null)
  const [muted, setMuted] = useState(false)
  const [paused, setPaused] = useState(false)

  const react = useCallback(
    (events: CluesEvent[]) => {
      for (const event of events) {
        if (event.type === 'clueFound') {
          setMessage(`Clue ${event.number}! ${event.clue.emoji}`)
          if (!muted) sound.play('brickSnap')
        }
        if (event.type === 'nothingHere') setMessage(`Nothing in the ${event.place.name}. Keep looking!`)
        if (event.type === 'allCluesFound') setMessage('That is 3 clues! Time to think! 🤔')
        if (event.type === 'wrongGuess') {
          setWrongChoice(event.choice.name)
          setMessage('Nuh-uh! Look at the clues and think again.')
        }
        if (event.type === 'solved') {
          setBest(recordFinalScore(bestScores, game.snapshot().solved).best)
          if (!muted) sound.play('victoryRoar')
        }
      }
    },
    [bestScores, game, muted, sound],
  )

  const act = (events: CluesEvent[]) => {
    sound.unlock()
    react(events)
    setSnapshot(game.snapshot())
  }

  useEffect(() => {
    if (!wrongChoice) return
    const timer = setTimeout(() => setWrongChoice(null), NUH_UH_MS)
    return () => clearTimeout(timer)
  }, [wrongChoice])

  const nextMystery = () => {
    game.nextMystery()
    setSnapshot(game.snapshot())
    setMessage(INTRO)
  }

  const { answer } = snapshot

  return (
    <main className="dino-clues">
      <header className="hud">
        <p className="hud__score" role="note">
          Best: {best}
        </p>
        <p className="hud__score" role="status">
          Solved: {snapshot.solved}
        </p>
      </header>
      <FrameControls sound={{ muted, onToggle: () => setMuted(!muted) }} pause={{ paused, onPause: () => setPaused(true) }} />
      <h2 className="dino-clues__question">
        <span aria-hidden="true">🦖 </span>
        {snapshot.question}
      </h2>
      <div className="dino-clues__scene" role="group" aria-label="Hiding places">
        {snapshot.places.map(({ place, state }, index) => (
          <button
            key={place.name}
            className={`dino-clues__place dino-clues__place--${state}`}
            aria-label={state === 'hidden' ? `Look in the ${place.name}` : state === 'clue' ? `The ${place.name}: found a clue` : `The ${place.name}: nothing here`}
            disabled={paused || state !== 'hidden' || snapshot.phase !== 'looking'}
            onClick={() => act(game.look(index))}
          >
            <span aria-hidden="true">{place.emoji}</span>
            {state === 'clue' && (
              <span className="dino-clues__found" aria-hidden="true">
                🔍
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="dino-clues__message" role="alert">
        {message}
      </p>
      <section className="dino-clues__notebook" aria-label="Clues">
        <ol className="dino-clues__clues">
          {Array.from({ length: CLUES_TO_FIND }, (_, index) => {
            const clue = snapshot.cluesFound[index]
            return (
              <li key={index} className={`dino-clues__clue${clue ? ' dino-clues__clue--found' : ''}`}>
                <span className="dino-clues__clue-emoji" aria-hidden="true">
                  {clue ? clue.emoji : '❔'}
                </span>
                <span className="dino-clues__clue-text">{clue ? clue.text : `Clue ${index + 1}`}</span>
              </li>
            )
          })}
        </ol>
      </section>
      {snapshot.choices.length > 0 && (
        <div className="dino-clues__choices" role="group" aria-label="Choices">
          {snapshot.choices.map((choice, index) => (
            <button
              key={choice.name}
              className={`dino-clues__choice${choice.name === wrongChoice ? ' dino-clues__choice--nuh-uh' : ''}`}
              aria-label={choice.name}
              disabled={paused || snapshot.phase !== 'thinking'}
              onClick={() => act(game.guess(index))}
            >
              <span className="dino-clues__choice-picture" aria-hidden="true">
                {choice.emoji}
              </span>
              <span aria-hidden="true">{choice.name}</span>
            </button>
          ))}
        </div>
      )}
      {paused && <PausedOverlay onResume={() => setPaused(false)} onMainMenu={onExit} />}
      {snapshot.phase === 'solved' && answer && !paused && (
        <Overlay title="You solved it!">
          <p className="overlay__message">
            It is {answer.phrase}! {answer.emoji}
          </p>
          <button className="big-button" autoFocus onClick={nextMystery}>
            Next mystery
          </button>
        </Overlay>
      )}
    </main>
  )
}
