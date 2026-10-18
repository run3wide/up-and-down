import { MAX_LIVES } from '../domain/game'

export function Hud({ score, lives, onPause }: { score: number; lives: number; onPause: () => void }) {
  return (
    <header className="hud">
      <div className="hud__lives" role="img" aria-label={`${lives} ${lives === 1 ? 'life' : 'lives'} left`}>
        {Array.from({ length: MAX_LIVES }, (_, i) => (
          <Heart key={i} lost={i >= lives} />
        ))}
      </div>
      <p className="hud__score" role="status">
        Score: {score}
      </p>
      <button className="hud__pause" onClick={onPause} aria-label="Pause">
        <span aria-hidden="true">❚❚</span>
      </button>
    </header>
  )
}

function Heart({ lost }: { lost: boolean }) {
  return (
    <svg viewBox="0 0 32 30" className={lost ? 'heart heart--lost' : 'heart'} aria-hidden="true">
      <path
        d="M16 29 C4 20 1 14 1 9 A7.5 7.5 0 0 1 16 6 A7.5 7.5 0 0 1 31 9 C31 14 28 20 16 29 Z"
        fill={lost ? '#ffffff80' : '#ff4f6d'}
        stroke="#fff"
        strokeWidth="2.5"
      />
    </svg>
  )
}
