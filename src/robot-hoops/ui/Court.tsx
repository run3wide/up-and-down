import { HOOP_HALF_WIDTH, HOOP_Y, LAUNCH_Y, ROBOT_X, type Shot } from '../domain/shot'

export type RobotMood = 'idle' | 'cheer' | 'oops'

const GROUND_TOP = 96
const BALL_RADIUS = 2.6

/** The court is drawn in world units: x as-is, y flipped so the ground is at 100. */
const screenY = (worldY: number) => 100 - worldY

interface CourtProps {
  aim: number
  shot: Shot | null
  hoopX: number
  mood: RobotMood
  showAim: boolean
  scoredFlash: boolean
}

export function Court({ aim, shot, hoopX, mood, showAim, scoredFlash }: CourtProps) {
  const ball = shot ?? { x: ROBOT_X, y: LAUNCH_Y }
  return (
    <svg className="court" viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <rect x="-100" y={GROUND_TOP} width="300" height="100" fill="url(#court-grass)" />
      <defs>
        <linearGradient id="court-grass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fcf6b" />
          <stop offset="1" stopColor="#3fae5a" />
        </linearGradient>
        <radialGradient id="court-ball" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffb066" />
          <stop offset="1" stopColor="#e8651a" />
        </radialGradient>
      </defs>
      <HoopBack x={hoopX} />
      {showAim && <AimArrow aim={aim} />}
      <RobotFigure aim={aim} mood={mood} />
      <BasketBall x={ball.x} y={ball.y} />
      <HoopFront x={hoopX} scored={scoredFlash} />
    </svg>
  )
}

function BasketBall({ x, y }: { x: number; y: number }) {
  const cx = x
  const cy = screenY(y)
  return (
    <g className="basketball">
      <circle cx={cx} cy={cy} r={BALL_RADIUS} fill="url(#court-ball)" stroke="#7a2e0a" strokeWidth="0.45" />
      <path
        d={`M${cx - BALL_RADIUS} ${cy} H${cx + BALL_RADIUS} M${cx} ${cy - BALL_RADIUS} V${cy + BALL_RADIUS} M${cx - 1.8} ${cy - 1.8} Q${cx - 0.6} ${cy} ${cx - 1.8} ${cy + 1.8} M${cx + 1.8} ${cy - 1.8} Q${cx + 0.6} ${cy} ${cx + 1.8} ${cy + 1.8}`}
        stroke="#7a2e0a"
        strokeWidth="0.35"
        fill="none"
      />
    </g>
  )
}

function HoopBack({ x }: { x: number }) {
  const rimY = screenY(HOOP_Y)
  return (
    <g className="hoop">
      <rect x={x - 9} y={rimY - 14} width="18" height="13" rx="1.5" fill="#fff" stroke="#e8651a" strokeWidth="0.8" />
      <rect x={x - 3.5} y={rimY - 7} width="7" height="5" fill="none" stroke="#e8651a" strokeWidth="0.6" />
      <ellipse cx={x} cy={rimY} rx={HOOP_HALF_WIDTH} ry="1.4" fill="none" stroke="#e8651a" strokeWidth="0.9" />
    </g>
  )
}

function HoopFront({ x, scored }: { x: number; scored: boolean }) {
  const rimY = screenY(HOOP_Y)
  const left = x - HOOP_HALF_WIDTH
  const right = x + HOOP_HALF_WIDTH
  return (
    <g className={scored ? 'hoop hoop--scored' : 'hoop'}>
      <g className="net" stroke="#fff" strokeWidth="0.45" fill="none" strokeOpacity="0.9">
        <path d={`M${left} ${rimY} L${x - 3.5} ${rimY + 9} M${left + 4.7} ${rimY} L${x - 1.2} ${rimY + 9} M${x} ${rimY + 1.4} V${rimY + 9} M${right - 4.7} ${rimY} L${x + 1.2} ${rimY + 9} M${right} ${rimY} L${x + 3.5} ${rimY + 9}`} />
        <path d={`M${left + 1.5} ${rimY + 3} Q${x} ${rimY + 5.5} ${right - 1.5} ${rimY + 3} M${left + 2.7} ${rimY + 6} Q${x} ${rimY + 8} ${right - 2.7} ${rimY + 6}`} />
      </g>
      <path d={`M${left} ${rimY} A${HOOP_HALF_WIDTH} 1.4 0 0 0 ${right} ${rimY}`} fill="none" stroke="#e8651a" strokeWidth="1.1" strokeLinecap="round" />
    </g>
  )
}

function AimArrow({ aim }: { aim: number }) {
  const originY = screenY(LAUNCH_Y)
  return (
    <g className="aim-arrow" transform={`rotate(${aim} ${ROBOT_X} ${originY})`}>
      <line x1={ROBOT_X} y1={originY - 4.5} x2={ROBOT_X} y2={originY - 16} stroke="#fff" strokeWidth="1.2" strokeDasharray="1.6 1.6" strokeLinecap="round" />
      <path d={`M${ROBOT_X - 2.2} ${originY - 15} L${ROBOT_X} ${originY - 19} L${ROBOT_X + 2.2} ${originY - 15} Z`} fill="#fff" />
    </g>
  )
}

function RobotFigure({ aim, mood }: { aim: number; mood: RobotMood }) {
  const neckY = screenY(5)
  return (
    <g className="robot">
      <circle cx={ROBOT_X - 6.5} cy="98.2" r="2.2" fill="#2b3a55" />
      <circle cx={ROBOT_X + 6.5} cy="98.2" r="2.2" fill="#2b3a55" />
      <rect x={ROBOT_X - 9} y="94" width="18" height="5.5" rx="2" fill="#4aa3ff" stroke="#1d4f91" strokeWidth="0.6" />
      <circle cx={ROBOT_X} cy="97" r="1.2" fill="#ffd23f" />
      <path d={`M${ROBOT_X - 8} 95.5 Q${ROBOT_X - 11} 89 ${ROBOT_X - 3.5} 87.6 M${ROBOT_X + 8} 95.5 Q${ROBOT_X + 11} 89 ${ROBOT_X + 3.5} 87.6`} stroke="#9aa9bd" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <g transform={`rotate(${aim} ${ROBOT_X} ${neckY})`}>
        <line x1={ROBOT_X} y1={neckY - 6} x2={ROBOT_X} y2={neckY - 9} stroke="#9aa9bd" strokeWidth="0.7" />
        <circle cx={ROBOT_X} cy={neckY - 9.5} r="0.9" fill="#ff6b8b" />
        <rect x={ROBOT_X - 6} y={neckY - 6} width="12" height="6.2" rx="2.4" fill="#e3e9f2" stroke="#1d4f91" strokeWidth="0.6" />
        <Face mood={mood} cy={neckY - 3} />
      </g>
    </g>
  )
}

function Face({ mood, cy }: { mood: RobotMood; cy: number }) {
  const left = ROBOT_X - 2.4
  const right = ROBOT_X + 2.4
  if (mood === 'cheer') {
    return (
      <>
        <path d={`M${left - 1} ${cy} Q${left} ${cy - 1.6} ${left + 1} ${cy} M${right - 1} ${cy} Q${right} ${cy - 1.6} ${right + 1} ${cy}`} stroke="#1d2b53" strokeWidth="0.6" fill="none" strokeLinecap="round" />
        <path d={`M${ROBOT_X - 1.6} ${cy + 1.4} Q${ROBOT_X} ${cy + 2.8} ${ROBOT_X + 1.6} ${cy + 1.4}`} stroke="#1d2b53" strokeWidth="0.5" fill="none" strokeLinecap="round" />
      </>
    )
  }
  return (
    <>
      <circle cx={left} cy={cy} r="0.95" fill="#1d2b53" />
      <circle cx={right} cy={cy} r="0.95" fill="#1d2b53" />
      <path d={mood === 'oops' ? `M${ROBOT_X - 1.4} ${cy + 2.2} Q${ROBOT_X} ${cy + 1.2} ${ROBOT_X + 1.4} ${cy + 2.2}` : `M${ROBOT_X - 1.4} ${cy + 1.7} Q${ROBOT_X} ${cy + 2.5} ${ROBOT_X + 1.4} ${cy + 1.7}`} stroke="#1d2b53" strokeWidth="0.5" fill="none" strokeLinecap="round" />
    </>
  )
}
