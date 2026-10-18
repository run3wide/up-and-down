/** The Lemon Volcano mascot, for the menu: a plump strawberry about to throw a lemon. */
export function StrawberryIcon() {
  const seeds: [number, number][] = [[44, 72], [70, 68], [56, 84], [78, 86], [38, 90], [62, 100], [48, 108]]
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className="strawberry-icon">
      <defs>
        <radialGradient id="icon-lemon" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fff7a8" />
          <stop offset="1" stopColor="#ffd400" />
        </radialGradient>
      </defs>
      <path d="M32 78 Q14 56 38 34 M88 78 Q106 56 82 34" stroke="#c92a3f" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M60 116 C20 108 20 62 60 62 C100 62 100 108 60 116 Z" fill="#ff4f6d" stroke="#b01f38" strokeWidth="3" />
      {seeds.map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="2.2" ry="3.4" fill="#ffe9a8" />
      ))}
      <path d="M36 66 Q44 52 60 64 Q76 52 84 66 Q72 72 60 66 Q48 72 36 66 Z" fill="#3fae5a" stroke="#2f8f48" strokeWidth="2.5" />
      <circle cx="48" cy="84" r="4.5" fill="#3b1020" />
      <circle cx="72" cy="84" r="4.5" fill="#3b1020" />
      <path d="M50 94 Q60 104 70 94 Z" fill="#7a1f2b" />
      <g transform="rotate(-18 60 28)">
        <circle cx="30" cy="28" r="5" fill="#f2c200" stroke="#a38b00" strokeWidth="2" />
        <circle cx="90" cy="28" r="5" fill="#f2c200" stroke="#a38b00" strokeWidth="2" />
        <ellipse cx="60" cy="28" rx="31" ry="19" fill="url(#icon-lemon)" stroke="#a38b00" strokeWidth="3" />
        <path d="M42 22 Q58 12 76 20" stroke="#fff" strokeOpacity="0.7" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  )
}
