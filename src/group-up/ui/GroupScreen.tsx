import { useCallback, useEffect, useRef, useState } from 'react'
import { recordFinalScore, type BestScoreStore } from '../../shared/bestScore'
import { FrameControls } from '../../shared/frame/FrameControls'
import { PausedOverlay } from '../../shared/Overlays'
import { show } from '../../shared/likeThings'
import { GroupGame, type Chip, type GroupEvent, type GroupQuiz } from '../domain/groupGame'
import '../../shared/hud.css'
import './group.css'

const NUH_UH_MS = 600
const DRAG_THRESHOLD_PX = 8
const INTRO = 'Put the same things in the same box. Drag them, or tap a chip and then a box!'

interface GroupScreenProps {
  createQuiz: () => GroupQuiz
  bestScores: BestScoreStore
  onExit: () => void
}

interface Drag {
  readonly chip: Chip
  readonly startX: number
  readonly startY: number
  moved: boolean
}

export function GroupScreen({ createQuiz, bestScores, onExit }: GroupScreenProps) {
  const [game] = useState(() => new GroupGame(createQuiz()))
  const [snapshot, setSnapshot] = useState(() => game.snapshot())
  const [best, setBest] = useState(() => bestScores.load())
  const [message, setMessage] = useState(INTRO)
  const [selected, setSelected] = useState<number | null>(null)
  const [refused, setRefused] = useState<string | null>(null)
  const [ghost, setGhost] = useState<{ text: string; x: number; y: number } | null>(null)
  const [paused, setPaused] = useState(false)
  const drag = useRef<Drag | null>(null)
  const justDragged = useRef(false)

  const react = useCallback(
    (events: GroupEvent[]) => {
      for (const event of events) {
        if (event.type === 'chipSorted') setMessage('')
        if (event.type === 'wrongBin') {
          setRefused(event.bin)
          setMessage('That is not the same thing! Try another box.')
        }
        if (event.type === 'allGrouped') {
          setMessage('All grouped! Now the same things are added up.')
          setBest(recordFinalScore(bestScores, game.snapshot().grouped).best)
        }
      }
    },
    [bestScores, game],
  )

  useEffect(() => {
    if (refused === null) return
    const timer = setTimeout(() => setRefused(null), NUH_UH_MS)
    return () => clearTimeout(timer)
  }, [refused])

  const move = (chip: Chip, bin: string) => {
    setSelected(null)
    react(game.move(chip.id, bin))
    setSnapshot(game.snapshot())
  }

  const tapChip = (chip: Chip) => {
    if (justDragged.current) return
    setSelected(selected === chip.id ? null : chip.id)
  }

  const tapBox = (bin: string) => {
    const chip = snapshot.pile.find((candidate) => candidate.id === selected)
    if (chip) move(chip, bin)
  }

  const startDrag = (chip: Chip, event: React.PointerEvent) => {
    drag.current = { chip, startX: event.clientX, startY: event.clientY, moved: false }
    const moving = (e: PointerEvent) => {
      const current = drag.current
      if (!current) return
      current.moved ||= Math.hypot(e.clientX - current.startX, e.clientY - current.startY) > DRAG_THRESHOLD_PX
      if (current.moved) setGhost({ text: show(chip.term), x: e.clientX, y: e.clientY })
    }
    const end = (e: PointerEvent) => {
      window.removeEventListener('pointermove', moving)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      const current = drag.current
      drag.current = null
      setGhost(null)
      if (!current?.moved) return
      justDragged.current = true
      setTimeout(() => (justDragged.current = false), 0)
      const box = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-box]')
      if (box && e.type === 'pointerup') move(chip, box.dataset.box!)
    }
    window.addEventListener('pointermove', moving)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  const nextSum = () => {
    game.nextSum()
    setSnapshot(game.snapshot())
    setMessage(INTRO)
  }

  const { phase, pile, bins, answer, prompt } = snapshot

  return (
    <main className="group-up">
      <header className="hud">
        <p className="hud__score" role="note">
          Best: {best}
        </p>
        <p className="hud__score" role="status">
          Sums: {snapshot.grouped}
        </p>
      </header>
      <FrameControls pause={{ paused, onPause: () => setPaused(true) }} />
      <h1 className="group-up__title">Group the same things</h1>
      <div className="group-up__pile" role="group" aria-label="Pile">
        {pile.map((chip) => (
          <button
            key={chip.id}
            className={`group-up__chip${selected === chip.id ? ' group-up__chip--selected' : ''}`}
            aria-label={show(chip.term)}
            disabled={paused}
            onPointerDown={(event) => startDrag(chip, event)}
            onClick={() => tapChip(chip)}
          >
            {show(chip.term)}
          </button>
        ))}
      </div>
      <p className="group-up__message" role="alert">
        {message}
      </p>
      <div className="group-up__boxes" role="group" aria-label="Boxes">
        {bins.map((bin) => (
          <button
            key={bin.symbol}
            data-box={bin.symbol}
            className={`group-up__box${refused === bin.symbol ? ' group-up__box--nuh-uh' : ''}`}
            aria-label={`Box for ${bin.symbol}`}
            disabled={paused || phase === 'grouped'}
            onClick={() => tapBox(bin.symbol)}
          >
            <span className="group-up__box-label" aria-hidden="true">
              {bin.symbol}
            </span>
            <span className="group-up__box-chips">
              {bin.chips.map((chip) => (
                <span key={chip.id} className="group-up__box-chip">
                  {show(chip.term)}
                </span>
              ))}
            </span>
            {bin.equation && bin.chips.length > 1 && <span className="group-up__equation">{bin.equation}</span>}
          </button>
        ))}
      </div>
      {phase === 'grouped' && answer && (
        <section className="group-up__answer" aria-label="Answer">
          <p className="group-up__answer-text">
            {prompt} = {answer}
          </p>
          <button className="big-button" autoFocus onClick={nextSum}>
            Next sum
          </button>
        </section>
      )}
      {ghost && (
        <span className="group-up__ghost" aria-hidden="true" style={{ left: ghost.x, top: ghost.y }}>
          {ghost.text}
        </span>
      )}
      {paused && <PausedOverlay onResume={() => setPaused(false)} onMainMenu={onExit} />}
    </main>
  )
}
