import { useCallback, useEffect, useRef, useState } from 'react'
import { recordFinalScore, type BestScoreStore } from '../../shared/bestScore'
import { PausedOverlay } from '../../shared/Overlays'
import { FrameControls } from '../../shared/frame/FrameControls'
import type { SoundPlayer } from '../../shared/sound/SoundPlayer'
import { SpellingGame, type SpellingEvent } from '../domain/spellingGame'
import { WORDS } from '../domain/words'
import '../../shared/hud.css'
import './spelling.css'

const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']
const DRAG_THRESHOLD_PX = 8
const NUH_UH_MS = 600

interface SpellingScreenProps {
  random: () => number
  bestScores: BestScoreStore
  sound: SoundPlayer
  onExit: () => void
}

interface Rejection {
  readonly letter: string
  readonly position: number
}

interface Drag {
  readonly letter: string
  readonly startX: number
  readonly startY: number
  x: number
  y: number
  moved: boolean
}

export function SpellingScreen({ random, bestScores, sound, onExit }: SpellingScreenProps) {
  const [game] = useState(() => new SpellingGame(WORDS, random))
  const [snapshot, setSnapshot] = useState(() => game.snapshot())
  const [best, setBest] = useState(() => bestScores.load())
  const [message, setMessage] = useState('Pick a letter, then tap a blank. Or drag it there!')
  const [selected, setSelected] = useState<string | null>(null)
  const [rejection, setRejection] = useState<Rejection | null>(null)
  const [dragGhost, setDragGhost] = useState<{ letter: string; x: number; y: number } | null>(null)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(false)
  const drag = useRef<Drag | null>(null)
  const justDragged = useRef(false)

  const react = useCallback(
    (events: SpellingEvent[]) => {
      for (const event of events) {
        if (event.type === 'letterPlaced') setMessage('')
        if (event.type === 'wrongLetter') {
          setRejection({ letter: event.letter, position: event.position })
          setMessage('Nuh-uh! Try another letter.')
        }
        if (event.type === 'wordSpelled') {
          setMessage(`You spelled ${event.word}! ${event.emoji}`)
          setBest(recordFinalScore(bestScores, game.snapshot().wordsSpelled).best)
          if (event.sound && !muted) sound.play(event.sound)
        }
      }
    },
    [bestScores, game, sound, muted],
  )

  const place = useCallback(
    (letter: string, position: number) => {
      sound.unlock()
      react(game.place(letter, position))
      setSnapshot(game.snapshot())
      setSelected(null)
    },
    [game, react, sound],
  )

  useEffect(() => {
    if (!rejection) return
    const timer = setTimeout(() => setRejection(null), NUH_UH_MS)
    return () => clearTimeout(timer)
  }, [rejection])

  const spelling = snapshot.phase === 'spelling' && !paused

  useEffect(() => {
    if (!spelling) return
    const typed = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || !/^[a-z]$/i.test(event.key)) return
      const firstBlank = game.snapshot().blanks.indexOf(null)
      place(event.key.toUpperCase(), firstBlank)
    }
    window.addEventListener('keydown', typed)
    return () => window.removeEventListener('keydown', typed)
  }, [spelling, game, place])

  const startDrag = (letter: string, event: React.PointerEvent) => {
    const here = { x: event.clientX, y: event.clientY }
    drag.current = { letter, startX: here.x, startY: here.y, ...here, moved: false }
    const move = (e: PointerEvent) => {
      const current = drag.current
      if (!current) return
      current.x = e.clientX
      current.y = e.clientY
      current.moved ||= Math.hypot(e.clientX - current.startX, e.clientY - current.startY) > DRAG_THRESHOLD_PX
      if (current.moved) setDragGhost({ letter, x: e.clientX, y: e.clientY })
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
      const blank = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-blank]')
      if (blank && e.type === 'pointerup') place(letter, Number(blank.dataset.blank))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  const tapLetter = (letter: string) => {
    if (justDragged.current) return
    setSelected(selected === letter ? null : letter)
  }

  const tapBlank = (position: number) => {
    if (selected) place(selected, position)
  }

  const nextWord = () => {
    game.nextWord()
    setSnapshot(game.snapshot())
    setMessage('')
  }

  return (
    <main className="speller">
      <header className="hud">
        <p className="hud__score" role="note">
          Best: {best}
        </p>
        <p className="hud__score" role="status">
          Score: {snapshot.wordsSpelled}
        </p>
      </header>
      <FrameControls sound={{ muted, onToggle: () => setMuted(!muted) }} pause={{ paused, onPause: () => setPaused(true) }} />
      <div key={snapshot.emoji + snapshot.wordsSpelled} className="speller__picture" role="img" aria-label="Picture to spell">
        {snapshot.emoji}
      </div>
      <div className="speller__word" role="group" aria-label="Word">
        {snapshot.blanks.map((placed, position) => {
          const nuhUh = rejection?.position === position
          return (
            <button
              key={position}
              data-blank={position}
              className={`speller__blank${placed ? ' speller__blank--filled' : ''}${nuhUh ? ' speller__blank--nuh-uh' : ''}`}
              aria-label={placed ? `Letter ${position + 1}: ${placed}` : `Blank ${position + 1}`}
              disabled={paused}
              onClick={() => tapBlank(position)}
            >
              {placed}
              {nuhUh && (
                <span className="speller__rejected" aria-hidden="true">
                  {rejection.letter}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <p className="speller__message" role="alert">
        {message}
      </p>
      {snapshot.phase === 'spelled' && (
        <button className="big-button" autoFocus onClick={nextWord}>
          Next word
        </button>
      )}
      <div className="speller__alphabet" role="group" aria-label="Alphabet">
        {ALPHABET.map((letter) => (
          <button
            key={letter}
            className={`speller__letter${selected === letter ? ' speller__letter--selected' : ''}`}
            disabled={!spelling}
            onPointerDown={(event) => startDrag(letter, event)}
            onClick={() => tapLetter(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      {dragGhost && (
        <span className="speller__ghost" aria-hidden="true" style={{ left: dragGhost.x, top: dragGhost.y }}>
          {dragGhost.letter}
        </span>
      )}
      {paused && <PausedOverlay onResume={() => setPaused(false)} onMainMenu={onExit} />}
    </main>
  )
}
