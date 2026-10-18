import { useCallback, useEffect, useRef, useState } from 'react'
import { recordFinalScore, type BestScoreStore } from '../../shared/bestScore'
import { PausedOverlay } from '../../shared/Overlays'
import { BucketGame, type BucketEvent } from '../domain/bucketGame'
import { BUCKETS, ITEMS } from '../domain/items'
import '../../shared/hud.css'
import './bucket.css'

const DRAG_THRESHOLD_PX = 8
const NUH_UH_MS = 600
const CHEER_MS = 700

interface BucketScreenProps {
  random: () => number
  bestScores: BestScoreStore
  onExit: () => void
}

interface Drag {
  readonly startX: number
  readonly startY: number
  moved: boolean
}

export function BucketScreen({ random, bestScores, onExit }: BucketScreenProps) {
  const [game] = useState(() => new BucketGame(BUCKETS, ITEMS, random))
  const [snapshot, setSnapshot] = useState(() => game.snapshot())
  const [best, setBest] = useState(() => bestScores.load())
  const [message, setMessage] = useState('Drag it to the bucket it belongs in. Or tap it, then tap a bucket!')
  const [picked, setPicked] = useState(false)
  const [nuhUhBucket, setNuhUhBucket] = useState<string | null>(null)
  const [cheerBucket, setCheerBucket] = useState<string | null>(null)
  const [dragGhost, setDragGhost] = useState<{ x: number; y: number } | null>(null)
  const [paused, setPaused] = useState(false)
  const drag = useRef<Drag | null>(null)
  const justDragged = useRef(false)

  const react = useCallback(
    (events: BucketEvent[]) => {
      for (const event of events) {
        if (event.type === 'sorted') {
          setCheerBucket(event.bucket.id)
          setMessage(`Yes! A ${event.item.name} is ${event.bucket.phrase}.`)
          setBest(recordFinalScore(bestScores, game.snapshot().sorted).best)
        }
        if (event.type === 'wrongBucket') {
          setNuhUhBucket(event.bucket.id)
          setMessage('Nuh-uh! Try another bucket.')
        }
      }
    },
    [bestScores, game],
  )

  const drop = useCallback(
    (bucketId: string) => {
      react(game.drop(bucketId))
      setSnapshot(game.snapshot())
      setPicked(false)
    },
    [game, react],
  )

  useEffect(() => {
    if (!nuhUhBucket) return
    const timer = setTimeout(() => setNuhUhBucket(null), NUH_UH_MS)
    return () => clearTimeout(timer)
  }, [nuhUhBucket])

  useEffect(() => {
    if (!cheerBucket) return
    const timer = setTimeout(() => setCheerBucket(null), CHEER_MS)
    return () => clearTimeout(timer)
  }, [cheerBucket])

  const startDrag = (event: React.PointerEvent) => {
    drag.current = { startX: event.clientX, startY: event.clientY, moved: false }
    const move = (e: PointerEvent) => {
      const current = drag.current
      if (!current) return
      current.moved ||= Math.hypot(e.clientX - current.startX, e.clientY - current.startY) > DRAG_THRESHOLD_PX
      if (current.moved) setDragGhost({ x: e.clientX, y: e.clientY })
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
      const target = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-bucket]')
      if (target && e.type === 'pointerup') drop(target.dataset.bucket!)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  const tapItem = () => {
    if (justDragged.current) return
    setPicked(!picked)
  }

  const tapBucket = (bucketId: string) => {
    if (picked) drop(bucketId)
  }

  const { item } = snapshot

  return (
    <main className="bucket-game">
      <header className="hud">
        <p className="hud__score" role="note">
          Best: {best}
        </p>
        <p className="hud__score" role="status">
          Score: {snapshot.sorted}
        </p>
        <div className="hud__actions">
          <button className="hud__pause" onClick={() => setPaused(true)} aria-label="Pause">
            <span aria-hidden="true">❚❚</span>
          </button>
        </div>
      </header>
      <button
        key={snapshot.sorted}
        className={`bucket-game__item${picked ? ' bucket-game__item--picked' : ''}${dragGhost ? ' bucket-game__item--dragging' : ''}`}
        aria-label={`Item: ${item.name}`}
        disabled={paused}
        onPointerDown={startDrag}
        onClick={tapItem}
      >
        {item.emoji}
      </button>
      <p className="bucket-game__message" role="alert">
        {message}
      </p>
      <div className="bucket-game__buckets" role="group" aria-label="Buckets">
        {snapshot.buckets.map((bucket) => (
          <button
            key={bucket.id}
            data-bucket={bucket.id}
            className={`bucket-game__bucket${bucket.id === nuhUhBucket ? ' bucket-game__bucket--nuh-uh' : ''}${bucket.id === cheerBucket ? ' bucket-game__bucket--cheer' : ''}`}
            aria-label={bucket.label}
            disabled={paused}
            onClick={() => tapBucket(bucket.id)}
          >
            <span className="bucket-game__bucket-picture" aria-hidden="true">
              {bucket.emoji}
            </span>
            <span className="bucket-game__bucket-label" aria-hidden="true">
              {bucket.label}
            </span>
          </button>
        ))}
      </div>
      {dragGhost && (
        <span className="bucket-game__ghost" aria-hidden="true" style={{ left: dragGhost.x, top: dragGhost.y }}>
          {item.emoji}
        </span>
      )}
      {paused && <PausedOverlay onResume={() => setPaused(false)} onMainMenu={onExit} />}
    </main>
  )
}
