import type { ItemKind } from '../domain/course'

export function ItemSprite({ kind }: { kind: ItemKind }) {
  if (kind === 'cone') return <Cone />
  if (kind === 'rock') return <Rock />
  return <Cookie />
}

function Cone() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <rect x="4" y="30" width="32" height="8" rx="2" fill="#ff8a2f" stroke="#a84a00" strokeWidth="1.4" />
      <path d="M20 3 L32 31 L8 31 Z" fill="#ff7a2f" stroke="#a84a00" strokeWidth="1.4" />
      <path d="M14 18 H26 L28 24 H12 Z" fill="#fff" />
    </svg>
  )
}

function Rock() {
  return (
    <svg viewBox="0 0 48 40" aria-hidden="true">
      <path d="M4 34 Q2 18 14 12 Q20 4 32 8 Q46 12 44 34 Z" fill="#8c8f99" stroke="#4d505b" strokeWidth="1.6" />
      <path d="M14 14 Q20 10 26 12 M30 20 Q36 22 38 28" stroke="#b7bac4" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function Cookie() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill="#d99a52" stroke="#9a5f24" strokeWidth="2" />
      <path d="M8 14 Q12 7 20 6 Q28 7 32 14" stroke="#f0bd7a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M33 25 A14 14 0 0 1 22 34" stroke="#b9772f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="14" cy="15" rx="3.4" ry="2.8" fill="#4a2a17" transform="rotate(-20 14 15)" />
      <ellipse cx="25" cy="13" rx="3" ry="2.4" fill="#4a2a17" transform="rotate(15 25 13)" />
      <ellipse cx="22" cy="22" rx="3.6" ry="3" fill="#4a2a17" transform="rotate(-10 22 22)" />
      <ellipse cx="11" cy="25" rx="2.8" ry="2.4" fill="#4a2a17" transform="rotate(25 11 25)" />
      <ellipse cx="19" cy="30" rx="3" ry="2.4" fill="#4a2a17" transform="rotate(-25 19 30)" />
      <ellipse cx="30" cy="22" rx="2.2" ry="1.9" fill="#4a2a17" />
    </svg>
  )
}

export function Tree() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="22" cy="23" r="15" fill="#1f6b36" opacity="0.35" />
      <circle cx="20" cy="20" r="15" fill="#2f9e4f" stroke="#1f6b36" strokeWidth="1.6" />
      <circle cx="15" cy="15" r="6" fill="#4cc36a" />
    </svg>
  )
}
