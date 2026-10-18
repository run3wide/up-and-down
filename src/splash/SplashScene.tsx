import { Stegosaurus } from '../art/Stegosaurus'

export function SplashScene() {
  return (
    <div className="scene" aria-hidden="true">
      <div className="cloud cloud--a" />
      <div className="cloud cloud--b" />
      <div className="cloud cloud--c" />
      <svg className="volcano" viewBox="0 0 200 140">
        <path d="M0 140 L72 30 L128 30 L200 140 Z" fill="#8a5a44" />
        <path d="M72 30 L128 30 L120 42 L108 36 L96 46 L84 36 Z" fill="#ff7a2f" />
        <circle className="smoke" cx="100" cy="14" r="12" fill="#fff" fillOpacity="0.7" />
        <circle className="smoke smoke--2" cx="108" cy="2" r="8" fill="#fff" fillOpacity="0.6" />
      </svg>
      <div className="ground" />
      <svg className="fern fern--left" viewBox="0 0 100 100">
        <path d="M50 100 Q50 50 20 20 M50 100 Q50 55 80 25 M50 100 Q50 40 50 8" stroke="#2f8f48" strokeWidth="8" fill="none" strokeLinecap="round" />
      </svg>
      <svg className="fern fern--right" viewBox="0 0 100 100">
        <path d="M50 100 Q50 50 20 20 M50 100 Q50 55 80 25 M50 100 Q50 40 50 8" stroke="#2f8f48" strokeWidth="8" fill="none" strokeLinecap="round" />
      </svg>
      <div className="stego-wrap">
        <Stegosaurus />
      </div>
    </div>
  )
}
