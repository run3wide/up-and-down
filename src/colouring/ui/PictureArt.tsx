import { COLOURS } from '../domain/colours'
import type { Fills } from '../domain/picture'
import type { Template } from '../domain/templates'

const BLANK = '#ffffff'

interface PictureArtProps {
  template: Template
  fills: Fills
  /** Without it the picture is just a thumbnail. */
  onPick?: (region: string) => void
}

const colourOf = (id: string | undefined) => COLOURS.find((colour) => colour.id === id)

export function PictureArt({ template, fills, onPick }: PictureArtProps) {
  return (
    <svg className="colouring__art" viewBox="0 0 100 100" role={onPick ? 'group' : undefined} aria-label={onPick ? template.name : undefined} aria-hidden={onPick ? undefined : true}>
      {template.regions.map((region) => {
        const colour = colourOf(fills[region.id])
        return (
          <path
            key={region.id}
            d={region.path}
            className="colouring__part"
            fill={colour?.hex ?? BLANK}
            {...(onPick && {
              role: 'button',
              tabIndex: 0,
              'aria-label': `${region.name}, ${colour?.name ?? 'not coloured'}`,
              onClick: () => onPick(region.id),
              onKeyDown: (event: React.KeyboardEvent) => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                onPick(region.id)
              },
            })}
          />
        )
      })}
      {template.lines.map((line) => (
        <path key={line} d={line} className="colouring__line" />
      ))}
    </svg>
  )
}
