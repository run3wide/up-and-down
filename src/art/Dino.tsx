export type DinoMood = 'idle' | 'cheer' | 'oops'

/** Friendly T-Rex, facing right. Drawn in a 160x120 box with its feet on the bottom edge. */
export function Dino({ mood = 'idle' }: { mood?: DinoMood }) {
  return (
    <svg viewBox="0 0 160 120" role="img" aria-label="Dinosaur" className="dino" data-mood={mood}>
      <path d="M30 70 Q6 66 2 92 Q18 84 38 92 Z" fill="#3fae5a" />
      <ellipse cx="68" cy="76" rx="44" ry="34" fill="#4cc36a" />
      <ellipse cx="76" cy="88" rx="28" ry="22" fill="#d9f5a8" />
      <path d="M50 44 L56 30 L64 44 M68 42 L76 28 L84 42" fill="#2f8f48" />
      <rect x="98" y="22" width="52" height="46" rx="22" fill="#4cc36a" />
      <circle cx="124" cy="38" r="9" fill="#fff" />
      <circle cx={mood === 'oops' ? 122 : 127} cy="39" r="4.5" fill="#222" />
      <circle cx="129" cy="36" r="1.6" fill="#fff" />
      <circle cx="136" cy="48" r="2" fill="#2f8f48" />
      <Mouth mood={mood} />
      <ellipse cx="100" cy="82" rx="9" ry="6" fill="#4cc36a" transform="rotate(-20 100 82)" />
      <rect x="48" y="100" width="20" height="20" rx="8" fill="#3fae5a" />
      <rect x="76" y="100" width="20" height="20" rx="8" fill="#3fae5a" />
      <ellipse cx="62" cy="118" rx="16" ry="5" fill="#2f8f48" />
      <ellipse cx="90" cy="118" rx="16" ry="5" fill="#2f8f48" />
    </svg>
  )
}

function Mouth({ mood }: { mood: DinoMood }) {
  if (mood === 'cheer') {
    return (
      <>
        <path d="M112 54 Q130 78 148 54 Z" fill="#7a1f2b" />
        <path d="M120 54 L123 60 L126 54 M132 54 L135 60 L138 54" fill="#fff" />
      </>
    )
  }
  if (mood === 'oops') return <path d="M116 60 Q130 54 144 60" stroke="#2f8f48" strokeWidth="3" fill="none" strokeLinecap="round" />
  return <path d="M114 56 Q130 68 146 56" stroke="#2f8f48" strokeWidth="3" fill="none" strokeLinecap="round" />
}
