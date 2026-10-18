import type { ItemKind } from '../domain/course'

export function ItemSprite({ kind }: { kind: ItemKind }) {
  if (kind === 'cone') return <Cone />
  if (kind === 'rock') return <Rock />
  return <Coin />
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

function Coin() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="16" fill="#ffd23f" stroke="#b8860b" strokeWidth="2.4" />
      <circle cx="20" cy="20" r="10" fill="none" stroke="#f2a900" strokeWidth="2" />
      <path d="M20 12 L22.4 17.6 L28.4 18 L23.8 21.8 L25.4 27.6 L20 24.4 L14.6 27.6 L16.2 21.8 L11.6 18 L17.6 17.6 Z" fill="#fff3a8" />
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
