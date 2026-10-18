export type DinoMood = 'idle' | 'cheer' | 'oops'

const GREEN = '#4cc36a'
const GREEN_DARK = '#2f8f48'
const GREEN_MID = '#3fae5a'

/** Friendly T-Rex, facing right. Drawn in a 160x120 box with its feet on the bottom edge. */
export function Dino({ mood = 'idle' }: { mood?: DinoMood }) {
  return (
    <svg viewBox="0 0 160 120" role="img" aria-label="T-Rex" className="dino" data-mood={mood}>
      <path d="M34 68 Q8 62 2 90 Q24 80 48 96 Z" fill={GREEN_MID} />
      <path d="M26 68 L32 57 L38 66 M44 60 L50 47 L57 58 M62 52 L69 38 L76 50" fill={GREEN_DARK} />
      <ellipse cx="62" cy="76" rx="38" ry="30" fill={GREEN} transform="rotate(-12 62 76)" />
      <path d="M70 48 L96 26 L100 52 L84 68 Z" fill={GREEN} />
      <ellipse cx="72" cy="88" rx="24" ry="18" fill="#d9f5a8" />
      <path d="M92 72 Q102 72 104 82" stroke={GREEN_DARK} strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="105" cy="84" r="1.8" fill="#fff" />
      <ellipse cx="60" cy="98" rx="18" ry="16" fill={GREEN_MID} />
      <path d="M42 118 Q42 106 60 106 L82 108 Q94 112 92 118 Z" fill={GREEN_MID} />
      <path d="M78 118 V112 M84 118 V112 M90 118 V114" stroke={GREEN_DARK} strokeWidth="2" strokeLinecap="round" />
      <Head mood={mood} />
    </svg>
  )
}

function Head({ mood }: { mood: DinoMood }) {
  return (
    <g>
      <Jaw mood={mood} />
      <path d="M92 26 Q92 14 106 14 L136 14 Q153 14 155 30 L155 40 Q155 46 149 46 L98 46 Q92 46 92 40 Z" fill={GREEN} />
      <path d="M112 46 L116 53 L120 46 M126 46 L130 53 L134 46 M140 46 L143 52 L146 46" fill="#fff" />
      <circle cx="148" cy="24" r="1.8" fill={GREEN_DARK} />
      <circle cx="118" cy="28" r="7" fill="#fff" />
      <circle cx={mood === 'oops' ? 116 : 120} cy="29" r="3.6" fill="#222" />
      <circle cx="121.5" cy="27" r="1.2" fill="#fff" />
    </g>
  )
}

function Jaw({ mood }: { mood: DinoMood }) {
  if (mood === 'cheer') {
    return (
      <g transform="rotate(24 98 46)">
        <path d="M98 46 L152 46 Q150 58 138 58 L108 58 Q98 58 98 46 Z" fill={GREEN_MID} />
        <path d="M104 46 L148 46 Q146 54 136 54 L110 54 Q104 54 104 46 Z" fill="#7a1f2b" />
      </g>
    )
  }
  return (
    <>
      <path d="M96 46 L152 46 Q150 57 138 57 L108 57 Q96 57 96 46 Z" fill={GREEN_MID} />
      {mood === 'oops' && <path d="M112 52 Q126 47 142 52" stroke={GREEN_DARK} strokeWidth="2.5" fill="none" strokeLinecap="round" />}
    </>
  )
}
