import { CRATER_HALF_WIDTH, CRATER_Y, LAUNCH_Y, STRAWBERRY_X, type Lemon } from '../domain/lemon'

export type StrawberryMood = 'idle' | 'cheer' | 'oops'

const GROUND_TOP = 96
const LEMON_RADIUS = 3

/** The court is drawn in world units: x as-is, y flipped so the ground is at 100. */
const screenY = (worldY: number) => 100 - worldY

interface CourtProps {
  aim: number
  lemon: Lemon | null
  craterX: number
  mood: StrawberryMood
  showAim: boolean
  scoredFlash: boolean
  /** Which eruption's lava is still flowing down the mountain, or null once it has cooled. */
  lavaFlow: number | null
}

export function Court({ aim, lemon, craterX, mood, showAim, scoredFlash, lavaFlow }: CourtProps) {
  const droppedIntoLava = scoredFlash && lemon !== null
  const visibleLemon = lemon ?? { x: STRAWBERRY_X, y: LAUNCH_Y }
  return (
    <svg className="court" viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <defs>
        <linearGradient id="court-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fcf6b" />
          <stop offset="1" stopColor="#3fae5a" />
        </linearGradient>
        <linearGradient id="court-rock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a86a4d" />
          <stop offset="1" stopColor="#6b3f2e" />
        </linearGradient>
        <radialGradient id="court-lemon" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fff7a8" />
          <stop offset="1" stopColor="#ffd400" />
        </radialGradient>
        <radialGradient id="court-lava" cx="50%" cy="40%" r="70%">
          <stop offset="0" stopColor="#ffe56a" />
          <stop offset="1" stopColor="#ff5a1f" />
        </radialGradient>
      </defs>
      <rect x="-100" y={GROUND_TOP} width="300" height="100" fill="url(#court-grass)" />
      <VolcanoBody x={craterX} scored={scoredFlash} lavaFlow={lavaFlow} />
      {showAim && <AimArrow aim={aim} />}
      <StrawberryFigure aim={aim} mood={mood} />
      {!droppedIntoLava && <LemonSprite x={visibleLemon.x} y={visibleLemon.y} />}
      <CraterLip x={craterX} />
    </svg>
  )
}

function LemonSprite({ x, y }: { x: number; y: number }) {
  const cx = x
  const cy = screenY(y)
  const spin = (x + y) * 6
  return (
    <g className="lemon" transform={`rotate(${spin} ${cx} ${cy})`}>
      <circle cx={cx - LEMON_RADIUS - 0.2} cy={cy} r="0.9" fill="#f2c200" stroke="#a38b00" strokeWidth="0.3" />
      <circle cx={cx + LEMON_RADIUS + 0.2} cy={cy} r="0.9" fill="#f2c200" stroke="#a38b00" strokeWidth="0.3" />
      <ellipse cx={cx} cy={cy} rx={LEMON_RADIUS + 0.3} ry="2.5" fill="url(#court-lemon)" stroke="#a38b00" strokeWidth="0.4" />
      <path d={`M${cx - 1.6} ${cy - 1} Q${cx} ${cy - 1.8} ${cx + 1.2} ${cy - 1.2}`} stroke="#fff" strokeOpacity="0.7" strokeWidth="0.45" fill="none" strokeLinecap="round" />
    </g>
  )
}

/** The mountain and the glowing crater mouth; the lemon is drawn after this, so it drops into the lava. */
function VolcanoBody({ x, scored, lavaFlow }: { x: number; scored: boolean; lavaFlow: number | null }) {
  const top = screenY(CRATER_Y)
  const mouth = CRATER_HALF_WIDTH + 1.5
  return (
    <g className={scored ? 'volcano-peak volcano-peak--erupting' : 'volcano-peak'}>
      <path d={`M${x - mouth} ${top} L${x + mouth} ${top} L${x + 22} ${GROUND_TOP + 1} L${x - 22} ${GROUND_TOP + 1} Z`} fill="url(#court-rock)" />
      <path d={`M${x - 5} ${top + 2} Q${x - 7} ${top + 14} ${x - 10} ${top + 30} M${x + 3} ${top + 2} Q${x + 5} ${top + 18} ${x + 7} ${top + 32}`} stroke="#ff7a2f" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeOpacity="0.85" />
      {lavaFlow !== null && <LavaFlows key={lavaFlow} x={x} top={top} />}
      <ellipse cx={x} cy={top} rx={mouth} ry="2.2" fill="#5a3324" />
      <ellipse cx={x} cy={top} rx={CRATER_HALF_WIDTH} ry="1.7" fill="url(#court-lava)" />
      <g className="smoke-puffs" fill="#fff" fillOpacity="0.75">
        <circle className="puff puff--1" cx={x - 1} cy={top - 4} r="2.4" />
        <circle className="puff puff--2" cx={x + 2} cy={top - 8} r="1.8" />
      </g>
      {scored && (
        <g className="lava-spray">
          {Array.from({ length: 12 }, (_, i) => (
            <circle
              key={i}
              cx={x}
              cy={top}
              r={0.8 + (i % 3) * 0.35}
              fill={i % 2 === 0 ? '#ff8a2f' : '#ffd23f'}
              style={{ '--dx': `${(i - 5.5) * 1.5}px`, '--dy': `${-(11 + (i % 4) * 3.5)}px` } as React.CSSProperties}
            />
          ))}
        </g>
      )}
    </g>
  )
}

/** Red lava pouring over the rim and down the flanks; remounting (new key) restarts the flow. */
function LavaFlows({ x, top }: { x: number; top: number }) {
  const streams = [
    `M${x - 6} ${top + 1} C${x - 9} ${top + 10} ${x - 7} ${top + 19} ${x - 12} ${top + 27} S${x - 17} ${top + 39} ${x - 19} ${top + 46}`,
    `M${x + 5} ${top + 1} C${x + 8} ${top + 8} ${x + 6} ${top + 20} ${x + 11} ${top + 28} S${x + 14} ${top + 39} ${x + 17} ${top + 46}`,
    `M${x} ${top + 2} C${x - 3} ${top + 12} ${x + 3} ${top + 20} ${x} ${top + 30} S${x - 3} ${top + 40} ${x + 1} ${top + 47}`,
  ]
  return (
    <g className="lava-flows">
      {streams.map((d, i) => (
        <g key={i} className="lava-flow" style={{ '--delay': `${i * 0.25}s` } as React.CSSProperties}>
          <path d={d} pathLength="1" stroke="#d4271a" strokeWidth="3.6" fill="none" strokeLinecap="round" />
          <path d={d} pathLength="1" stroke="#ff9d2e" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      ))}
    </g>
  )
}

function CraterLip({ x }: { x: number }) {
  const top = screenY(CRATER_Y)
  const mouth = CRATER_HALF_WIDTH + 1.5
  return <path d={`M${x - mouth} ${top} A${mouth} 2.2 0 0 0 ${x + mouth} ${top}`} fill="none" stroke="#8a5238" strokeWidth="1.3" strokeLinecap="round" />
}

function AimArrow({ aim }: { aim: number }) {
  const originY = screenY(LAUNCH_Y)
  return (
    <g className="aim-arrow" transform={`rotate(${aim} ${STRAWBERRY_X} ${originY})`}>
      <line x1={STRAWBERRY_X} y1={originY - 4.5} x2={STRAWBERRY_X} y2={originY - 16} stroke="#fff" strokeWidth="1.2" strokeDasharray="1.6 1.6" strokeLinecap="round" />
      <path d={`M${STRAWBERRY_X - 2.2} ${originY - 15} L${STRAWBERRY_X} ${originY - 19} L${STRAWBERRY_X + 2.2} ${originY - 15} Z`} fill="#fff" />
    </g>
  )
}

/** A plump strawberry holding the lemon overhead; it leans a little towards the aim. */
function StrawberryFigure({ aim, mood }: { aim: number; mood: StrawberryMood }) {
  const baseY = 99.5
  const seeds: [number, number][] = [[-4, 92], [3, 91.5], [-1, 95.5], [5, 95], [-5.5, 96.5], [1.5, 98]]
  return (
    <g className="strawberry" transform={`rotate(${aim * 0.5} ${STRAWBERRY_X} ${baseY})`}>
      <path d={`M${STRAWBERRY_X - 8} 93 Q${STRAWBERRY_X - 11} 89 ${STRAWBERRY_X - 4} 87.6 M${STRAWBERRY_X + 8} 93 Q${STRAWBERRY_X + 11} 89 ${STRAWBERRY_X + 4} 87.6`} stroke="#c92a3f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d={`M${STRAWBERRY_X} 99.8 C${STRAWBERRY_X - 11} 98 ${STRAWBERRY_X - 10} 89.5 ${STRAWBERRY_X} 89.5 C${STRAWBERRY_X + 10} 89.5 ${STRAWBERRY_X + 11} 98 ${STRAWBERRY_X} 99.8 Z`} fill="#ff4f6d" stroke="#b01f38" strokeWidth="0.6" />
      {seeds.map(([dx, y]) => (
        <ellipse key={`${dx}-${y}`} cx={STRAWBERRY_X + dx} cy={y} rx="0.45" ry="0.75" fill="#ffe9a8" />
      ))}
      <path d={`M${STRAWBERRY_X - 5} 90 Q${STRAWBERRY_X - 3} 87.8 ${STRAWBERRY_X} 89.6 Q${STRAWBERRY_X + 3} 87.8 ${STRAWBERRY_X + 5} 90 Q${STRAWBERRY_X + 2} 91.2 ${STRAWBERRY_X} 90 Q${STRAWBERRY_X - 2} 91.2 ${STRAWBERRY_X - 5} 90 Z`} fill="#3fae5a" stroke="#2f8f48" strokeWidth="0.4" />
      <Face mood={mood} cy={94.2} />
    </g>
  )
}

function Face({ mood, cy }: { mood: StrawberryMood; cy: number }) {
  const left = STRAWBERRY_X - 3
  const right = STRAWBERRY_X + 3
  if (mood === 'cheer') {
    return (
      <>
        <path d={`M${left - 1.1} ${cy} Q${left} ${cy - 1.7} ${left + 1.1} ${cy} M${right - 1.1} ${cy} Q${right} ${cy - 1.7} ${right + 1.1} ${cy}`} stroke="#3b1020" strokeWidth="0.6" fill="none" strokeLinecap="round" />
        <path d={`M${STRAWBERRY_X - 2} ${cy + 1.2} Q${STRAWBERRY_X} ${cy + 3.6} ${STRAWBERRY_X + 2} ${cy + 1.2} Z`} fill="#7a1f2b" />
      </>
    )
  }
  return (
    <>
      <circle cx={left} cy={cy} r="1" fill="#3b1020" />
      <circle cx={right} cy={cy} r="1" fill="#3b1020" />
      <path d={mood === 'oops' ? `M${STRAWBERRY_X - 1.6} ${cy + 2.6} Q${STRAWBERRY_X} ${cy + 1.6} ${STRAWBERRY_X + 1.6} ${cy + 2.6}` : `M${STRAWBERRY_X - 1.6} ${cy + 1.8} Q${STRAWBERRY_X} ${cy + 3} ${STRAWBERRY_X + 1.6} ${cy + 1.8}`} stroke="#3b1020" strokeWidth="0.55" fill="none" strokeLinecap="round" />
    </>
  )
}
