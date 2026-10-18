/** A red race car seen from above, nose pointing up, with a T-Rex at the wheel. Also the menu mascot. */
export function RaceCar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 70" aria-hidden="true" className={className}>
      <rect x="2" y="14" width="7" height="14" rx="3" fill="#222" />
      <rect x="31" y="14" width="7" height="14" rx="3" fill="#222" />
      <rect x="1" y="46" width="8" height="15" rx="3" fill="#222" />
      <rect x="31" y="46" width="8" height="15" rx="3" fill="#222" />
      <rect x="6" y="3" width="28" height="7" rx="3" fill="#c92a3f" />
      <path d="M10 8 Q10 2 20 2 Q30 2 30 8 L33 56 Q33 67 20 67 Q7 67 7 56 Z" fill="#ff4f6d" stroke="#8f1d33" strokeWidth="1.6" />
      <rect x="18" y="4" width="4" height="19" fill="#fff" fillOpacity="0.85" />
      <rect x="9" y="60" width="22" height="5" rx="2" fill="#c92a3f" />
      <rect x="11.5" y="24" width="17" height="27" rx="7" fill="#5a1a28" />
      <TRexDriver />
    </svg>
  )
}

/** The driver: tail trailing over the boot, a spiky back, tiny arms on the wheel and a toothy snout over the bonnet. */
function TRexDriver() {
  return (
    <g>
      <path d="M15.5 47 Q14 58 18.6 67 Q20 69 21.4 67 Q26 58 24.5 47 Z" fill="#3fae5a" stroke="#2f8f48" strokeWidth="0.8" />
      <ellipse cx="20" cy="43" rx="8.6" ry="8" fill="#4cc36a" stroke="#2f8f48" strokeWidth="0.8" />
      <path d="M17.6 44 L20 39.6 L22.4 44 M17.8 50 L20 46 L22.2 50 M18.4 56 L20 52.6 L21.6 56 M18.8 61 L20 58.4 L21.2 61" fill="#2f8f48" />
      <ellipse cx="20" cy="37.6" rx="6.4" ry="1.7" fill="none" stroke="#1d1d1d" strokeWidth="1.6" />
      <path d="M12.8 43.6 L16.2 37.8 M27.2 43.6 L23.8 37.8" stroke="#3fae5a" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="16" cy="37.6" r="1.1" fill="#fff" />
      <circle cx="24" cy="37.6" r="1.1" fill="#fff" />
      <path d="M13.4 32 Q13 26 17 22 Q18.6 12 20 12 Q21.4 12 23 22 Q27 26 26.6 32 Q20 36 13.4 32 Z" fill="#4cc36a" stroke="#2f8f48" strokeWidth="0.8" />
      <circle cx="14.2" cy="27.6" r="2.7" fill="#fff" />
      <circle cx="25.8" cy="27.6" r="2.7" fill="#fff" />
      <circle cx="14.8" cy="27" r="1.4" fill="#222" />
      <circle cx="25.2" cy="27" r="1.4" fill="#222" />
      <circle cx="18.4" cy="14.6" r="0.7" fill="#2f8f48" />
      <circle cx="21.6" cy="14.6" r="0.7" fill="#2f8f48" />
      <path d="M17.2 20.6 L18.2 23 L19.2 20.6 M20.8 20.6 L21.8 23 L22.8 20.6" fill="#fff" />
    </g>
  )
}
