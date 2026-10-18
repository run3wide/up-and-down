export function Ball({ size }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" className="ball">
      <defs>
        <radialGradient id="ball-shine" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fff6a8" />
          <stop offset="0.5" stopColor="#ff8a3d" />
          <stop offset="1" stopColor="#e5484d" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#ball-shine)" stroke="#b3262c" strokeWidth="2" />
      <path d="M6 14 Q20 22 34 14 M6 26 Q20 18 34 26" stroke="#fff" strokeOpacity="0.7" strokeWidth="2" fill="none" />
    </svg>
  )
}
