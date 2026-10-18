import type { CSSProperties } from 'react'
import type { LavaSplat } from './lavaEruption'

export function LavaSplats({ splats }: { splats: readonly LavaSplat[] }) {
  return (
    <div className="lava-splats" aria-hidden="true">
      {splats.map((splat) => (
        <span
          key={splat.id}
          className="lava-splat"
          style={
            {
              left: `${splat.left}%`,
              top: `${splat.top}%`,
              width: `${splat.size}rem`,
              height: `${splat.size * 0.92}rem`,
              '--delay': `${splat.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
