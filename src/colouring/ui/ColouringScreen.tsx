import { useState } from 'react'
import type { GalleryStore } from '../application/GalleryStore'
import { COLOURS } from '../domain/colours'
import { Picture, type Fills, type PictureSnapshot } from '../domain/picture'
import { TEMPLATES, type Template } from '../domain/templates'
import { PictureArt } from './PictureArt'
import '../../shared/overlays.css'
import './colouring.css'

interface ColouringScreenProps {
  gallery: GalleryStore
  onExit: () => void
}

export function ColouringScreen({ gallery, onExit }: ColouringScreenProps) {
  const [saved, setSaved] = useState(() => gallery.load())
  const [picture, setPicture] = useState<Picture | null>(null)
  const [snapshot, setSnapshot] = useState<PictureSnapshot | null>(null)

  const open = (template: Template) => {
    const next = new Picture(template, saved[template.id])
    setPicture(next)
    setSnapshot(next.snapshot())
  }

  const showShelf = () => {
    setSaved(gallery.load())
    setPicture(null)
    setSnapshot(null)
  }

  if (!picture || !snapshot) return <Shelf saved={saved} onOpen={open} onExit={onExit} />

  const change = (edit: (picture: Picture) => void) => {
    edit(picture)
    const next = picture.snapshot()
    setSnapshot(next)
    gallery.save(next.template.id, next.fills)
  }

  return <Easel snapshot={snapshot} onChange={change} onShelf={showShelf} />
}

function Shelf({ saved, onOpen, onExit }: { saved: Readonly<Record<string, Fills>>; onOpen: (template: Template) => void; onExit: () => void }) {
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
      <div className="colouring__palette" role="group" aria-label="Colours">
        {COLOURS.map(({ id, name, hex }) => (
          <button key={id} className="colouring__swatch" style={{ background: hex }} aria-label={name} aria-pressed={colour === id} onClick={() => setColour(id)} />
        ))}
      </div>
    </main>
  )
}
