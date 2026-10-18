/** A friendly red race car seen from above, nose pointing up. Also used as the menu mascot. */
export function RaceCar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 70" aria-hidden="true" className={className}>
      <rect x="2" y="14" width="7" height="14" rx="3" fill="#222" />
      <rect x="31" y="14" width="7" height="14" rx="3" fill="#222" />
      <rect x="1" y="46" width="8" height="15" rx="3" fill="#222" />
      <rect x="31" y="46" width="8" height="15" rx="3" fill="#222" />
      <rect x="6" y="3" width="28" height="7" rx="3" fill="#c92a3f" />
      <path d="M10 8 Q10 2 20 2 Q30 2 30 8 L33 56 Q33 67 20 67 Q7 67 7 56 Z" fill="#ff4f6d" stroke="#8f1d33" strokeWidth="1.6" />
      <rect x="18" y="4" width="4" height="60" fill="#fff" fillOpacity="0.85" />
      <path d="M12 26 Q20 21 28 26 L27 36 Q20 39 13 36 Z" fill="#9fe3ff" stroke="#35617a" strokeWidth="1.2" />
      <rect x="9" y="60" width="22" height="5" rx="2" fill="#c92a3f" />
      <circle cx="13" cy="9" r="2.4" fill="#fff6a8" />
      <circle cx="27" cy="9" r="2.4" fill="#fff6a8" />
    </svg>
  )
}
