import { useState } from 'react'
import { Dino } from '../../art/Dino'
import { recordFinalScore, type BestScoreStore } from '../../shared/bestScore'
import { SoundToggle } from '../../shared/SoundToggle'
import type { SoundPlayer } from '../../shared/sound/SoundPlayer'
import { TicTacToeGame, type TicTacToeEvent } from '../domain/ticTacToeGame'
import '../../shared/hud.css'
import '../../shared/overlays.css'
import './ticTacToe.css'

interface TicTacToeScreenProps {
  random: () => number
  bestScores: BestScoreStore
  sound: SoundPlayer
  onExit: () => void
}

const MESSAGES = {
  playing: 'Your turn! You are X.',
  won: 'Winner! 🎉',
  lost: 'Good try! Let’s try again.',
  drawn: 'A tie! Let’s try again.',
} as const

export function TicTacToeScreen({ random, bestScores, sound, onExit }: TicTacToeScreenProps) {
  const [game] = useState(() => new TicTacToeGame(random))
  const [snapshot, setSnapshot] = useState(() => game.snapshot())
  const [muted, setMuted] = useState(false)

  const react = (events: TicTacToeEvent[]) => {
    for (const event of events) {
      if (event.type !== 'gameWon') continue
      recordFinalScore(bestScores, game.snapshot().wins)
      if (!muted) sound.play('winner')
    }
  }

  const play = (square: number) => {
    sound.unlock()
    react(game.play(square))
    setSnapshot(game.snapshot())
  }

  const playAgain = () => {
    game.playAgain()
    setSnapshot(game.snapshot())
  }

  const roundOver = snapshot.phase !== 'playing'

  return (
    <main className="tic-tac-toe">
      <header className="hud">
        <button className="hud__pause" onClick={onExit} aria-label="Back to games">
          <span aria-hidden="true">🏠</span>
        </button>
        <p className="hud__score" role="status">
          Wins: {snapshot.wins}
        </p>
        <SoundToggle muted={muted} onToggle={() => setMuted(!muted)} />
      </header>
      <h1 className="tic-tac-toe__title">Tic Tac Toe</h1>
      <p className="tic-tac-toe__message" role="alert">
        {MESSAGES[snapshot.phase]}
      </p>
      <div className="tic-tac-toe__board" role="group" aria-label="Board">
        {snapshot.squares.map((mark, square) => (
          <button
            key={square}
            className={`tic-tac-toe-square${mark ? ` tic-tac-toe-square--${mark}` : ''}${snapshot.winningLine?.includes(square) ? ' tic-tac-toe-square--line' : ''}`}
            aria-label={`Square ${square + 1}, ${mark ?? 'empty'}`}
            disabled={roundOver || mark !== null}
            onClick={() => play(square)}
          >
            <span aria-hidden="true">{mark}</span>
          </button>
        ))}
      </div>
      {snapshot.phase === 'won' && (
        <div className="tic-tac-toe__winner">
          <Dino mood="cheer" />
          <p className="tic-tac-toe__shout" aria-hidden="true">
            WINNER!
          </p>
        </div>
      )}
      {roundOver && (
        <button className="big-button" autoFocus onClick={playAgain}>
          Play again
        </button>
      )}
    </main>
  )
}
