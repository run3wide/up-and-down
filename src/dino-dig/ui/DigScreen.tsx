import { useCallback, useEffect, useRef, useState } from 'react'
import { recordFinalScore, type BestScoreStore } from '../../shared/bestScore'
import { PausedOverlay } from '../../shared/Overlays'
import { SoundToggle } from '../../shared/SoundToggle'
import type { SoundPlayer } from '../../shared/sound/SoundPlayer'
import type { CollectionStore } from '../application/CollectionStore'
import { DigGame, type DigEvent } from '../domain/digGame'
import { DINOSAURS, type Bone } from '../domain/dinosaurs'
import { BoneArt } from './BoneArt'
import { Museum } from './Museum'
import { placement } from './placement'
import '../../shared/hud.css'
import './dig.css'

const DRAG_THRESHOLD_PX = 8
const NUH_UH_MS = 600

interface DigScreenProps {
  random: () => number
  bestScores: BestScoreStore
  collection: CollectionStore
  sound: SoundPlayer
  onExit: () => void
}

interface Drag {
  readonly bone: string
  readonly startX: number
  readonly startY: number
  moved: boolean
}

const nearbyLabel = (count: number) => (count === 0 ? 'Cleared' : `Cleared, ${count} ${count === 1 ? 'bone' : 'bones'} nearby`)

export function DigScreen({ random, bestScores, collection, sound, onExit }: DigScreenProps) {
  const [game] = useState(() => new DigGame(DINOSAURS, random))
  const [snapshot, setSnapshot] = useState(() => game.snapshot())
  const [best, setBest] = useState(() => bestScores.load())
  const [collected, setCollected] = useState(() => collection.load())
  const [message, setMessage] = useState('Brush the dirt to find the bones!')
  const [selected, setSelected] = useState<string | null>(null)
  const [rejectedSpot, setRejectedSpot] = useState<string | null>(null)
  const [dragGhost, setDragGhost] = useState<{ bone: Bone; x: number; y: number } | null>(null)
  const [paused, setPaused] = useState(false)
  const [showMuseum, setShowMuseum] = useState(false)
  const [muted, setMuted] = useState(false)
  const brushing = useRef(false)
  const drag = useRef<Drag | null>(null)
  const justDragged = useRef(false)

  const { dinosaur } = snapshot
  const boneById = (id: string) => dinosaur.bones.find((bone) => bone.id === id)!

  const react = useCallback(
    (events: DigEvent[]) => {
      for (const event of events) {
        if (event.type === 'boneFound') setMessage(`You found a ${boneLabel(game, event.bone)}!`)
        if (event.type === 'allBonesFound') setMessage('Now put the bones together!')
        if (event.type === 'wrongSpot') {
          setRejectedSpot(event.spot)
          setMessage('Nuh-uh! Try another spot.')
        }
        if (event.type === 'bonePlaced') setMessage('')
        if (event.type === 'dinosaurBuilt') {
          setMessage(`You built a ${event.name}! 🎉`)
          collection.add(event.dinosaur)
          setCollected(collection.load())
          setBest(recordFinalScore(bestScores, game.snapshot().dinosaursBuilt).best)
          if (!muted) sound.play('roar')
        }
      }
      setSnapshot(game.snapshot())
    },
    [bestScores, collection, game, muted, sound],
  )

  const brush = useCallback(
    (cell: number) => {
      sound.unlock()
      react(game.brush(cell))
    },
    [game, react, sound],
  )

  const place = useCallback(
    (bone: string, spot: string) => {
      sound.unlock()
      react(game.place(bone, spot))
      setSelected(null)
    },
    [game, react, sound],
  )

  useEffect(() => {
    if (!rejectedSpot) return
    const timer = setTimeout(() => setRejectedSpot(null), NUH_UH_MS)
    return () => clearTimeout(timer)
  }, [rejectedSpot])

  const playing = !paused && !showMuseum

  const cellUnder = (x: number, y: number) => {
    const cell = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-cell]')
    return cell ? Number(cell.dataset.cell) : null
  }

  const startBrushing = (event: React.PointerEvent) => {
    brushing.current = true
    const stop = () => {
      brushing.current = false
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    const cell = cellUnder(event.clientX, event.clientY)
    if (cell !== null) brush(cell)
  }

  const keepBrushing = (event: React.PointerEvent) => {
    if (!brushing.current) return
    const cell = cellUnder(event.clientX, event.clientY)
    if (cell !== null) brush(cell)
  }

  const startDrag = (bone: string, event: React.PointerEvent) => {
    drag.current = { bone, startX: event.clientX, startY: event.clientY, moved: false }
    const move = (e: PointerEvent) => {
      const current = drag.current
      if (!current) return
      current.moved ||= Math.hypot(e.clientX - current.startX, e.clientY - current.startY) > DRAG_THRESHOLD_PX
      if (current.moved) setDragGhost({ bone: boneById(bone), x: e.clientX, y: e.clientY })
    }
    const end = (e: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      const current = drag.current
      drag.current = null
      setDragGhost(null)
      if (!current?.moved) return
      justDragged.current = true
      setTimeout(() => (justDragged.current = false), 0)
      const spot = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-spot]')
      if (spot && e.type === 'pointerup') place(bone, spot.dataset.spot!)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  const tapBone = (bone: string) => {
    if (justDragged.current) return
    setSelected(selected === bone ? null : bone)
  }

  const tapSpot = (spot: string) => {
    if (selected) place(selected, spot)
  }

  const digAgain = () => {
    game.nextDig()
    setSnapshot(game.snapshot())
    setMessage('Brush the dirt to find the bones!')
  }

  const building = snapshot.phase !== 'digging'

  return (
    <main className="dig">
      <header className="hud">
        <p className="hud__score" role="note">
          Best: {best}
        </p>
        <p className="hud__score" role="status">
          Score: {snapshot.dinosaursBuilt}
        </p>
        <div className="hud__actions">
          <button className="hud__pause" onClick={() => setShowMuseum(true)} aria-label="Museum">
            <span aria-hidden="true">🏛️</span>
          </button>
          <SoundToggle muted={muted} onToggle={() => setMuted(!muted)} />
          <button className="hud__pause" onClick={() => setPaused(true)} aria-label="Pause">
            <span aria-hidden="true">❚❚</span>
          </button>
        </div>
      </header>
      <h1 className="dig__title">Dig for a {dinosaur.name}!</h1>
      <p className="dig__message" role="alert">
        {message}
      </p>
      {!building && (
        <div
          className="dig__site"
          role="group"
          aria-label="Dig site"
          style={{ gridTemplateColumns: `repeat(${snapshot.cols}, 1fr)` }}
          onPointerDown={startBrushing}
          onPointerMove={keepBrushing}
        >
          {snapshot.cells.map((cell, index) => (
            <button
              key={index}
              data-cell={index}
              className={`dig__cell${cell.cleared ? ' dig__cell--cleared' : ''}`}
              aria-label={cell.bone ? `Bone: ${boneLabel(game, cell.bone)}` : cell.cleared ? nearbyLabel(cell.nearby) : `Dirt ${index + 1}`}
              disabled={!playing}
              onClick={() => brush(index)}
            >
              {cell.bone ? <span aria-hidden="true">🦴</span> : cell.cleared && cell.nearby > 0 && <span className="dig__dots" aria-hidden="true">{'•'.repeat(cell.nearby)}</span>}
            </button>
          ))}
        </div>
      )}
      {building && (
        <div className={`dig__stage${snapshot.phase === 'built' ? ' dig__stage--built' : ''}`} role="group" aria-label="Skeleton">
          {dinosaur.bones.map((bone, index) => {
            const isPlaced = snapshot.placed.includes(bone.id)
            const nuhUh = rejectedSpot === bone.id
            return (
              <button
                key={bone.id}
                data-spot={bone.id}
                className={`dig__spot${isPlaced ? ' dig__spot--placed' : ''}${nuhUh ? ' dig__spot--nuh-uh' : ''}`}
                style={placement(bone)}
                aria-label={isPlaced ? capitalised(bone.label) : `Empty spot ${index + 1}`}
                disabled={!playing || isPlaced}
                onClick={() => tapSpot(bone.id)}
              >
                <BoneArt kind={bone.kind} />
              </button>
            )
          })}
          {snapshot.phase === 'built' && (
            <>
              <span className="dig__sparkle dig__sparkle--one" aria-hidden="true">✨</span>
              <span className="dig__sparkle dig__sparkle--two" aria-hidden="true">✨</span>
              <span className="dig__sparkle dig__sparkle--three" aria-hidden="true">✨</span>
            </>
          )}
        </div>
      )}
      <p className="dig__count">Bones: {snapshot.tray.length + snapshot.placed.length} of {dinosaur.bones.length}</p>
      <div className="dig__tray" role="group" aria-label="Bones found">
        {snapshot.tray.map((id) => (
          <button
            key={id}
            className={`dig__bone${selected === id ? ' dig__bone--selected' : ''}`}
            aria-label={`Bone: ${boneLabel(game, id)}`}
            disabled={!playing || !building}
            onPointerDown={(event) => startDrag(id, event)}
            onClick={() => tapBone(id)}
          >
            <BoneArt kind={boneById(id).kind} />
          </button>
        ))}
      </div>
      {snapshot.phase === 'built' && (
        <button className="big-button" autoFocus onClick={digAgain}>
          Dig again
        </button>
      )}
      {dragGhost && (
        <span className="dig__ghost" aria-hidden="true" style={{ left: dragGhost.x, top: dragGhost.y }}>
          <BoneArt kind={dragGhost.bone.kind} />
        </span>
      )}
      {paused && <PausedOverlay onResume={() => setPaused(false)} onMainMenu={onExit} />}
      {showMuseum && <Museum collected={collected} onClose={() => setShowMuseum(false)} />}
    </main>
  )
}

function boneLabel(game: DigGame, id: string): string {
  return game.snapshot().dinosaur.bones.find((bone) => bone.id === id)!.label
}

function capitalised(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
