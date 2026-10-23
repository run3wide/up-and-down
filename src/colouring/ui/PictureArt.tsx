import { useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { COLOURS } from '../domain/colours'
import { numberSpots, type NumberSpot } from '../domain/partNumbers'
import type { Fills } from '../domain/picture'
import type { Template } from '../domain/templates'

const BLANK = '#ffffff'

interface PictureArtProps {
  template: Template
  fills: Fills
  /** Without it the picture is just a thumbnail. */
  onPick?: (region: string) => void
  /** The part to colour next, outlined so it can be found on the picture. */
  current?: string
}

const colourOf = (id: string | undefined) => COLOURS.find((colour) => colour.id === id)

const NUMBER_SIZE = { smallest: 3.8, biggest: 8, perUnitOfRoom: 1.1 }

/** Measuring a whole picture takes a moment, and it never changes, so each is measured once and kept here. */
const spotsByPicture = new Map<string, (NumberSpot | null)[]>()
const watchers = new Set<() => void>()
const NO_SPOTS: (NumberSpot | null)[] = []

const watch = (onChange: () => void) => {
  watchers.add(onChange)
  return () => void watchers.delete(onChange)
}

/** Asks the browser which part is on top at a point, by trying the parts from the top down. */
function measureSpots(parts: SVGPathElement[]): (NumberSpot | null)[] {
  const owner = (x: number, y: number) => {
    for (let part = parts.length - 1; part >= 0; part--) if (parts[part].isPointInFill({ x, y })) return part
    return null
  }
  return numberSpots(owner, parts.length)
}

/** Where each part's number goes. Without a browser to measure in (tests), no numbers are placed. */
function useNumberSpots(template: Template, wanted: boolean) {
  const svg = useRef<SVGSVGElement>(null)
  const spots = useSyncExternalStore(watch, () => spotsByPicture.get(template.id) ?? NO_SPOTS)
  useLayoutEffect(() => {
    if (!wanted || spotsByPicture.has(template.id)) return
    const parts = [...(svg.current?.querySelectorAll<SVGPathElement>('.colouring__part') ?? [])]
    if (parts.length === 0 || typeof parts[0].isPointInFill !== 'function') return
    spotsByPicture.set(template.id, measureSpots(parts))
    watchers.forEach((notify) => notify())
  }, [template, wanted])
  return { svg, spots }
}

export function PictureArt({ template, fills, onPick, current }: PictureArtProps) {
  const { svg, spots } = useNumberSpots(template, onPick !== undefined)
  return (
    <svg ref={svg} className="colouring__art" viewBox="0 0 100 100" role={onPick ? 'group' : undefined} aria-label={onPick ? template.name : undefined} aria-hidden={onPick ? undefined : true}>
      {template.regions.map((region) => {
        const colour = colourOf(fills[region.id])
        return (
          <path
            key={region.id}
            d={region.path}
            className={`colouring__part${region.id === current ? ' colouring__part--current' : ''}`}
            fill={colour?.hex ?? BLANK}
            {...(onPick && {
              role: 'button',
              tabIndex: 0,
              'aria-label': `${region.name}, number ${template.regions.indexOf(region) + 1}, ${colour?.name ?? 'not coloured'}`,
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
      {onPick &&
        spots.map((spot, index) =>
          spot && !(template.regions[index].id in fills) ? (
            <text
              key={template.regions[index].id}
              className="colouring__number"
              x={spot.x}
              y={spot.y}
              fontSize={Math.min(NUMBER_SIZE.biggest, Math.max(NUMBER_SIZE.smallest, spot.room * NUMBER_SIZE.perUnitOfRoom))}
              aria-hidden="true"
            >
              {index + 1}
            </text>
          ) : null,
        )}
    </svg>
  )
}
