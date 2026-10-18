import { Ball } from '../../art/Ball'
import { Dino, type DinoMood } from '../../art/Dino'
import type { Ball as BallState } from '../domain/ball'
import { BALL_RADIUS, DINO_WIDTH } from '../domain/catching'

export const GROUND = 3

export interface Burst {
  readonly id: number
  readonly x: number
  readonly kind: 'sparkle' | 'poof'
}

interface PlayfieldProps {
  dinoX: number
  ball: BallState | null
  mood: DinoMood
  bursts: readonly Burst[]
}

/** The stage is square, so one world unit is 1% of its width and height. */
export function Playfield({ dinoX, ball, mood, bursts }: PlayfieldProps) {
  return (
    <>
      <div className="dino-sprite" style={{ left: `${dinoX}%`, bottom: `${GROUND}%`, width: `${DINO_WIDTH}%` }}>
        <Dino mood={mood} />
      </div>
      {ball && (
        <div
          className="ball-sprite"
          style={{ left: `${ball.x}%`, bottom: `${GROUND + ball.y}%`, width: `${BALL_RADIUS * 2}%` }}
        >
          <Ball />
        </div>
      )}
      {bursts.map((burst) => (
        <div key={burst.id} className={`burst burst--${burst.kind}`} style={{ left: `${burst.x}%`, bottom: `${GROUND + 8}%` }} aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} style={{ '--angle': `${i * 45}deg` } as React.CSSProperties} />
          ))}
        </div>
      ))}
    </>
  )
}
