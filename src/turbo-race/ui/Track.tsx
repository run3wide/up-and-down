import type { CSSProperties } from 'react'
import { RaceCar } from '../../art/RaceCar'
import { FINISH_DISTANCE } from '../domain/course'
import type { RaceSnapshot } from '../domain/raceGame'
import { ItemSprite, Tree } from './RoadSprites'

/** The stage is square, so one world unit is 1% of its width and height. */
const CAR_WIDTH = 12
const CAR_HEIGHT = 21
const CAR_BOTTOM = 6
const CAR_CENTRE = CAR_BOTTOM + CAR_HEIGHT / 2
const TREE_SPACING = 26
const ITEM_SIZE = { cone: 6, rock: 7.5, cookie: 5.5 } as const

interface TrackProps {
  snapshot: RaceSnapshot
  crashed: boolean
  cookiePop: number
}

export function Track({ snapshot, crashed, cookiePop }: TrackProps) {
  const { distance, carX, items, invulnerable } = snapshot
  const finishAhead = FINISH_DISTANCE - distance
  return (
    <>
      <div className="road" style={{ '--travelled': distance } as CSSProperties}>
        <div className="road__centre-line" />
      </div>
      {treesAround(distance).map((tree) => (
        <div key={tree.key} className="tree" style={{ left: `${tree.x}%`, bottom: `${CAR_CENTRE + tree.ahead}%` }}>
          <Tree />
        </div>
      ))}
      {finishAhead < 100 && finishAhead > -20 && <div className="finish-line" style={{ bottom: `${CAR_CENTRE + finishAhead}%` }} />}
      {items.map((item) => (
        <div
          key={item.id}
          className={`road-item road-item--${item.kind}`}
          style={{ left: `${item.x}%`, bottom: `${CAR_CENTRE + item.ahead}%`, width: `${ITEM_SIZE[item.kind]}%` }}
        >
          <ItemSprite kind={item.kind} />
        </div>
      ))}
      <div
        className={`race-car${crashed ? ' race-car--crashed' : ''}${invulnerable ? ' race-car--flashing' : ''}`}
        style={{ left: `${carX}%`, bottom: `${CAR_BOTTOM}%`, width: `${CAR_WIDTH}%`, height: `${CAR_HEIGHT}%` }}
      >
        <RaceCar />
        {cookiePop > 0 && (
          <span key={cookiePop} className="cookie-pop" aria-hidden="true">
            +1
          </span>
        )}
      </div>
    </>
  )
}

function treesAround(distance: number): { key: number; x: number; ahead: number }[] {
  const first = Math.ceil((distance - 15) / TREE_SPACING)
  const last = Math.floor((distance + 100) / TREE_SPACING)
  return Array.from({ length: Math.max(last - first + 1, 0) }, (_, i) => {
    const index = first + i
    return { key: index, x: index % 2 === 0 ? 8 + (index % 3) * 3 : 86 - (index % 3) * 3, ahead: index * TREE_SPACING - distance }
  })
}
