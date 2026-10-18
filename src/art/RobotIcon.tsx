/** The Robot Hoops mascot, for the menu: a friendly robot holding a basketball. */
export function RobotIcon() {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className="robot-icon">
      <defs>
        <radialGradient id="icon-ball" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffb066" />
          <stop offset="1" stopColor="#e8651a" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="112" r="8" fill="#2b3a55" />
      <circle cx="80" cy="112" r="8" fill="#2b3a55" />
      <rect x="28" y="70" width="64" height="38" rx="10" fill="#4aa3ff" stroke="#1d4f91" strokeWidth="3" />
      <circle cx="60" cy="89" r="6" fill="#ffd23f" />
      <path d="M32 78 Q14 60 36 40 M88 78 Q106 60 84 40" stroke="#9aa9bd" strokeWidth="7" fill="none" strokeLinecap="round" />
      <rect x="34" y="34" width="52" height="34" rx="12" fill="#e3e9f2" stroke="#1d4f91" strokeWidth="3" />
      <circle cx="48" cy="50" r="5" fill="#1d2b53" />
      <circle cx="72" cy="50" r="5" fill="#1d2b53" />
      <path d="M50 59 Q60 66 70 59" stroke="#1d2b53" strokeWidth="3" fill="none" strokeLinecap="round" />
      <line x1="60" y1="34" x2="60" y2="24" stroke="#9aa9bd" strokeWidth="3" />
      <circle cx="60" cy="21" r="4" fill="#ff6b8b" />
      <circle cx="94" cy="26" r="14" fill="url(#icon-ball)" stroke="#7a2e0a" strokeWidth="2.5" />
      <path d="M80 26 H108 M94 12 V40 M84 16 Q90 26 84 36 M104 16 Q98 26 104 36" stroke="#7a2e0a" strokeWidth="2" fill="none" />
    </svg>
  )
}
