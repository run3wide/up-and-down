import { useEffect, useRef, useState } from 'react'
import type { GalleryStore } from '../application/GalleryStore'
import type { SketchStore } from '../application/SketchStore'
import { Drawing, type DrawingSnapshot, type Stroke } from '../domain/drawing'
import { Palette } from './Palette'
import { Sketchpad } from './Sketchpad'
import { StrokeArt } from './StrokeArt'
import { COLOURS } from '../domain/colours'
import { Picture, nextToColour, type Fills, type PictureSnapshot } from '../domain/picture'
import { TEMPLATES, type Template } from '../domain/templates'
import { PictureArt } from './PictureArt'
import '../../shared/overlays.css'
import './colouring.css'

interface ColouringScreenProps {
  gallery: GalleryStore
  sketches: SketchStore
}

export function ColouringScreen({ gallery, sketches }: ColouringScreenProps) {
  const [saved, setSaved] = useState(() => gallery.load())
  const [sketch, setSketch] = useState(() => sketches.load())
  const [picture, setPicture] = useState<Picture | null>(null)
  const [snapshot, setSnapshot] = useState<PictureSnapshot | null>(null)
  const [drawing, setDrawing] = useState<Drawing | null>(null)
  const [drawingSnapshot, setDrawingSnapshot] = useState<DrawingSnapshot | null>(null)

  const open = (template: Template) => {
    const next = new Picture(template, saved[template.id])
    setPicture(next)
    setSnapshot(next.snapshot())
  }

  const openSketchpad = () => {
    const next = new Drawing(sketch)
    setDrawing(next)
    setDrawingSnapshot(next.snapshot())
  }

  const showShelf = () => {
    setSaved(gallery.load())
    setSketch(sketches.load())
    setPicture(null)
    setSnapshot(null)
    setDrawing(null)
    setDrawingSnapshot(null)
  }

  if (drawing && drawingSnapshot) {
    const changeDrawing = (edit: (drawing: Drawing) => void) => {
      edit(drawing)
      const next = drawing.snapshot()
      setDrawingSnapshot(next)
      sketches.save(next.strokes)
    }
    return <Sketchpad snapshot={drawingSnapshot} onChange={changeDrawing} onShelf={showShelf} />
  }

  if (!picture || !snapshot) return <Shelf saved={saved} sketch={sketch} onOpen={open} onOpenSketchpad={openSketchpad} />

  const change = (edit: (picture: Picture) => void) => {
    edit(picture)
    const next = picture.snapshot()
    setSnapshot(next)
    gallery.save(next.template.id, next.fills)
  }

  return <Easel snapshot={snapshot} onChange={change} onShelf={showShelf} />
}

interface ShelfProps {
  saved: Readonly<Record<string, Fills>>
  sketch: readonly Stroke[]
  onOpen: (template: Template) => void
  onOpenSketchpad: () => void
}

function Shelf({ saved, sketch, onOpen, onOpenSketchpad }: ShelfProps) {
  return (
    <main className="colouring">
      <h1 className="colouring__title">Pick a picture to colour</h1>
      <div className="colouring__shelf" role="group" aria-label="Pictures">
        {TEMPLATES.map((template) => {
          const fills = saved[template.id] ?? {}
          const coloured = Object.keys(fills).length
          return (
            <button key={template.id} className="colouring__card" aria-label={`${template.name}, ${shelfProgress(coloured, template)}`} onClick={() => onOpen(template)}>
              <PictureArt template={template} fills={fills} />
              <span aria-hidden="true">{template.name}</span>
            </button>
          )
        })}
        <button className="colouring__card" aria-label={`Free draw, ${sketch.length === 0 ? 'not started' : 'started'}`} onClick={onOpenSketchpad}>
          <svg className="colouring__art" viewBox="0 0 100 100" aria-hidden="true">
            <StrokeArt strokes={sketch} />
          </svg>
          <span aria-hidden="true">Free draw</span>
        </button>
      </div>
    </main>
  )
}

const shelfProgress = (coloured: number, template: Template) =>
  coloured === 0 ? 'not started' : `${coloured} of ${template.regions.length} parts coloured`

interface EaselProps {
  snapshot: PictureSnapshot
  onChange: (edit: (picture: Picture) => void) => void
  onShelf: () => void
}

/** Typed digits make one number if they come close together and the number exists. */
const DIGIT_WINDOW_MS = 1200

function Easel({ snapshot, onChange, onShelf }: EaselProps) {
  const [colour, setColour] = useState(COLOURS[0].id)
  const [byNumber, setByNumber] = useState(true)
  const { template, fills, finished } = snapshot
  const [current, setCurrent] = useState(() => nextToColour(template, fills, -1) ?? 0)
  const typed = useRef({ digits: '', at: 0 })
  const count = template.regions.length

  const fillCurrentWith = (chosen: string) => {
    const region = template.regions[current]
    onChange((picture) => picture.fill(region.id, chosen))
    setCurrent(nextToColour(template, { ...fills, [region.id]: chosen }, current) ?? current)
  }

  const choose = (chosen: string) => {
    setColour(chosen)
    if (byNumber) fillCurrentWith(chosen)
  }

  const pick = (regionId: string) => {
    if (byNumber) return setCurrent(template.regions.findIndex((region) => region.id === regionId))
    onChange((picture) => picture.fill(regionId, colour))
  }

  useEffect(() => {
    if (!byNumber) return
    const typeDigit = (event: KeyboardEvent) => {
      if (!/^\d$/.test(event.key) || event.ctrlKey || event.metaKey || event.altKey) return
      const recent = event.timeStamp - typed.current.at < DIGIT_WINDOW_MS
      const joined = (recent ? typed.current.digits : '') + event.key
      const digits = Number(joined) >= 1 && Number(joined) <= count ? joined : event.key
      typed.current = { digits, at: event.timeStamp }
      if (Number(digits) >= 1 && Number(digits) <= count) setCurrent(Number(digits) - 1)
    }
    window.addEventListener('keydown', typeDigit)
    return () => window.removeEventListener('keydown', typeDigit)
  }, [byNumber, count])

  const step = (by: number) => setCurrent((index) => (index + by + count) % count)

  return (
    <main className="colouring">
      <header className="colouring__bar">
        <button className="colouring__tool" onClick={onShelf}>
          My pictures
        </button>
        <button className="colouring__tool" onClick={() => onChange((picture) => picture.undo())}>
          Undo
        </button>
        <button className="colouring__tool" onClick={() => onChange((picture) => picture.clear())}>
          Clear
        </button>
      </header>
      <h1 className="colouring__title">Colour the {template.name}</h1>
      <p className="colouring__message" role="status">
        {finished ? 'All coloured in! 🎉 Change any part you like.' : ''}
      </p>
      <div className="colouring__workspace">
        <PictureArt template={template} fills={fills} current={byNumber ? template.regions[current].id : undefined} onPick={pick} />
        <aside className="colouring__number-box" aria-label="Current part">
          {byNumber && (
            <>
              <p className="colouring__number-label">Colour number</p>
              <p className="colouring__number-big" data-testid="current-number" aria-live="polite">
                {current + 1}
              </p>
              <p className="colouring__number-name">{template.regions[current].name}</p>
              <div className="colouring__number-steps">
                <button className="colouring__tool" aria-label="Previous number" onClick={() => step(-1)}>
                  ◀
                </button>
                <button className="colouring__tool" aria-label="Next number" onClick={() => step(1)}>
                  ▶
                </button>
              </div>
            </>
          )}
          <button className="colouring__tool colouring__mode" aria-pressed={byNumber} onClick={() => setByNumber(!byNumber)}>
            Colour by number: {byNumber ? 'on' : 'off'}
          </button>
        </aside>
      </div>
      <Palette chosen={colour} onChoose={choose} />
    </main>
  )
}
