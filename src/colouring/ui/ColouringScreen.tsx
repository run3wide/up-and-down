import { useState } from 'react'
import type { GalleryStore } from '../application/GalleryStore'
import type { SketchStore } from '../application/SketchStore'
import { Drawing, type DrawingSnapshot, type Stroke } from '../domain/drawing'
import { Palette } from './Palette'
import { Sketchpad } from './Sketchpad'
import { StrokeArt } from './StrokeArt'
import { COLOURS } from '../domain/colours'
import { Picture, type Fills, type PictureSnapshot } from '../domain/picture'
import { TEMPLATES, type Template } from '../domain/templates'
import { PictureArt } from './PictureArt'
import '../../shared/overlays.css'
import './colouring.css'

interface ColouringScreenProps {
  gallery: GalleryStore
  sketches: SketchStore
  onExit: () => void
}

export function ColouringScreen({ gallery, sketches, onExit }: ColouringScreenProps) {
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

  if (!picture || !snapshot) return <Shelf saved={saved} sketch={sketch} onOpen={open} onOpenSketchpad={openSketchpad} onExit={onExit} />

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
  onExit: () => void
}

function Shelf({ saved, sketch, onOpen, onOpenSketchpad, onExit }: ShelfProps) {
  return (
    <main className="colouring">
      <header className="colouring__bar">
        <button className="colouring__tool" onClick={onExit}>
          Back to games
        </button>
      </header>
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

function Easel({ snapshot, onChange, onShelf }: EaselProps) {
  const [colour, setColour] = useState(COLOURS[0].id)
  const { template, fills, finished } = snapshot

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
      <PictureArt template={template} fills={fills} onPick={(region) => onChange((picture) => picture.fill(region, colour))} />
      <Palette chosen={colour} onChoose={setColour} />
    </main>
  )
}
