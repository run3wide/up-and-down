import { useState } from 'react'
import type { BestScoreStore } from '../../shared/bestScore'
import { DIFFICULTIES, LEVELS, type Difficulty } from '../domain/items'
import { BucketRound } from './BucketRound'
import './bucket.css'

interface BucketScreenProps {
  random: () => number
  /** Each level keeps its own best score: a hard round is not comparable with an easy one. */
  bestScores: Record<Difficulty, BestScoreStore>
  onExit: () => void
}

const LABELS: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

export function BucketScreen({ random, bestScores, onExit }: BucketScreenProps) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)

  if (difficulty) return <BucketRound level={LEVELS[difficulty]} random={random} bestScores={bestScores[difficulty]} onExit={onExit} />

  return (
    <main className="bucket-game bucket-game--levels">
      <h2 className="bucket-game__levels-heading">Pick a level</h2>
      <div className="bucket-game__levels" role="group" aria-label="Levels">
        {DIFFICULTIES.map((level) => (
          <button key={level} className="bucket-game__level" onClick={() => setDifficulty(level)}>
            <span className="bucket-game__level-name">{LABELS[level]}</span>
            <span className="bucket-game__level-buckets" aria-hidden="true">
              {LEVELS[level].buckets.map((bucket) => bucket.emoji).join(' ')}
            </span>
          </button>
        ))}
      </div>
    </main>
  )
}
