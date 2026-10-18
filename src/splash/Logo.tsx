import { Ball } from '../art/Ball'
import { Dino } from '../art/Dino'

function Word({ text, direction }: { text: string; direction: 'up' | 'down' }) {
  return (
    <span className={`logo__word logo__word--${direction}`} aria-hidden="true">
      {[...text].map((letter, i) => (
        <span key={i} className="logo__letter" style={{ '--i': i } as React.CSSProperties}>
          {letter}
        </span>
      ))}
    </span>
  )
}

export function Logo({ as: Heading = 'h1' }: { as?: 'h1' | 'span' }) {
  return (
    <Heading className="logo" aria-label={Heading === 'h1' ? 'Up and Down' : undefined} aria-hidden={Heading === 'span' || undefined}>
      <span className="logo__peek" aria-hidden="true">
        <Dino mood="cheer" />
      </span>
      <Word text="Up" direction="up" />
      <span className="logo__ball" aria-hidden="true">
        <Ball />
      </span>
      <Word text="Down" direction="down" />
    </Heading>
  )
}
