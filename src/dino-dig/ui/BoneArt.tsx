import type { BoneKind } from '../domain/dinosaurs'

const POSITIONS = (count: number, from: number, step: number) => Array.from({ length: count }, (_, i) => from + i * step)

function Joint({ x, y, r = 9 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} />
}

/** A shaft with a knob at each end, the classic bone shape. */
function Shaft({ from, to }: { from: [number, number]; to: [number, number] }) {
  return (
    <>
      <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} strokeWidth="9" />
      <Joint x={from[0]} y={from[1]} />
      <Joint x={to[0]} y={to[1]} />
    </>
  )
}

const DRAWINGS: Record<BoneKind, React.ReactNode> = {
  skull: (
    <>
      <path d="M4 58 Q4 28 32 22 L78 16 Q97 20 96 46 Q96 70 80 76 L42 82 Q30 94 16 80 Q4 72 4 58Z" />
      <circle cx="62" cy="40" r="9" className="bone-art__hole" />
      <path d="M14 72 L50 70 M22 70 v9 M32 70 v9 M42 69 v9" fill="none" />
    </>
  ),
  neck: (
    <>
      <path d="M78 84 L24 16" fill="none" strokeWidth="6" />
      {[[78, 84], [64, 65], [50, 46], [36, 29], [24, 16]].map(([x, y]) => (
        <Joint key={x} x={x} y={y} r={12} />
      ))}
    </>
  ),
  ribs: (
    <>
      <path d="M4 12 H96" fill="none" strokeWidth="9" />
      {POSITIONS(5, 16, 15).map((x) => (
        <path key={x} d={`M${x} 14 Q${x - 12} 55 ${x + 4} 92`} fill="none" strokeWidth="8" />
      ))}
    </>
  ),
  arm: <Shaft from={[30, 14]} to={[70, 86]} />,
  leg: (
    <>
      <Shaft from={[45, 10]} to={[62, 50]} />
      <Shaft from={[62, 50]} to={[40, 82]} />
      <Shaft from={[40, 82]} to={[12, 90]} />
    </>
  ),
  tail: (
    <>
      {POSITIONS(8, 0, 1).map((i) => (
        <Joint key={i} x={14 + i * 11.5} y={62 - i * 4} r={18 - i * 2} />
      ))}
    </>
  ),
  plates: (
    <>
      {POSITIONS(5, 3, 19).map((x, i) => (
        <path key={x} d={`M${x} 92 L${x + 9} ${i % 2 === 0 ? 8 : 24} L${x + 18} 92Z`} />
      ))}
    </>
  ),
}

/** Draws one bone to fill whatever box it is given; the box says how long or tall it is. */
export function BoneArt({ kind, className = '' }: { kind: BoneKind; className?: string }) {
  return (
    <svg className={`bone-art ${className}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {DRAWINGS[kind]}
    </svg>
  )
}
