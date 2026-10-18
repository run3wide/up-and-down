import { useEffect, useRef } from 'react'
import { Logo } from './Logo'
import { SplashScene } from './SplashScene'
import './splash.css'

export function SplashScreen({ onStart }: { onStart: () => void }) {
  const startRef = useRef<HTMLButtonElement>(null)
  useEffect(() => startRef.current?.focus(), [])

  return (
    <main className="splash">
      <SplashScene />
      <div className="splash__content">
        <Logo />
        <p className="splash__byline">by Daniel Robson</p>
        <button ref={startRef} className="start-button" onClick={onStart}>
          Start
        </button>
      </div>
    </main>
  )
}
