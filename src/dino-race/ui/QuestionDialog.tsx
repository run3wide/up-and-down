import type { MathQuestion } from '../domain/quiz'

interface QuestionDialogProps {
  question: MathQuestion
  wrongPicks: readonly number[]
  onAnswer: (optionIndex: number) => void
}

export function QuestionDialog({ question, wrongPicks, onAnswer }: QuestionDialogProps) {
  return (
    <div className="overlay">
      <div className="overlay__card quiz" role="dialog" aria-modal="true" aria-label="Maths question">
        <h2>Brain break!</h2>
        <p className="quiz__prompt">
          {question.prompt} <span className="quiz__blank" aria-hidden="true">?</span>
        </p>
        <div className="quiz__options">
          {question.options.map((option, index) => (
            <button
              key={option}
              className={wrongPicks.includes(index) ? 'quiz__option quiz__option--wrong' : 'quiz__option'}
              disabled={wrongPicks.includes(index)}
              onClick={() => onAnswer(index)}
            >
              {option}
            </button>
          ))}
        </div>
        <p className="quiz__hint" aria-live="polite">
          {wrongPicks.length > 0 && 'Look closely - only the SAME things go together!'}
        </p>
      </div>
    </div>
  )
}
