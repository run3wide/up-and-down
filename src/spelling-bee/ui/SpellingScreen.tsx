import { useState } from 'react'
import type { BestScoreStore } from '../../shared/bestScore'
import type { SoundPlayer } from '../../shared/sound/SoundPlayer'
import { DIFFICULTIES, LEVELS, type Difficulty } from '../domain/words'
import { SpellingRound } from './SpellingRound'
import './spelling.css'

interface SpellingScreenProps {
  random: () => number
  /** Each level keeps its own best score: ten-letter words are not comparable with three-letter ones. */
  bestScores: Record<Difficulty, BestScoreStore>
  sound: SoundPlayer
  onExit: () => void
}

const LABELS: Record<Difficulty, { name: string; example: string }> = {
  easy: { name: 'Easy', example: '🐱 CAT' },
  medium: { name: 'Medium', example: '🍌 BANANA' },
  hard: { name: 'Hard', example: '🍉 WATERMELON' },
}

export function SpellingScreen({ random, bestScores, sound, onExit }: SpellingScreenProps) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)

  if (difficulty) return <SpellingRound words={LEVELS[difficulty]} random={random} bestScores={bestScores[difficulty]} sound={sound} onExit={onExit} />

  return (
    <main className="speller speller--levels">
      <h2 className="speller__levels-heading">Pick a level</h2>
      <div className="speller__levels" role="group" aria-label="Levels">
        {DIFFICULTIES.map((level) => (
          <button key={level} className="speller__level" onClick={() => setDifficulty(level)}>
            <span className="speller__level-name">{LABELS[level].name}</span>
            <span className="speller__level-example" aria-hidden="true">
              {LABELS[level].example}
            </span>
          </button>
        ))}
      </div>
    </main>
  )
}
