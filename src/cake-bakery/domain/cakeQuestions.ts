import { mixedThings, sameThing } from '../../dino-race/domain/mathQuestions'
import type { MathQuestion, Quiz } from '../../dino-race/domain/quiz'

type Random = () => number

const FRUIT = ['🍍', '🍌', '🍇', '🍓', '🍎']
const SHAPES = ['⭐', '🔺', '🟦', '🟢']
const LETTERS = ['x', 'y', 'p', 'z']
const FIRST_MIXED_QUESTION = 3
const FIRST_LETTER_QUESTION = 5
const FIRST_LONG_SUM = 7

/** Fruit or shapes at first, then letters, then sums as long as 1x + 2y + 3x + 1y: the baker grows into it. */
export function cakeQuiz(random: Random): Quiz {
  return { ask: (questionNumber) => buildCakeQuestion(random, questionNumber) }
}

function buildCakeQuestion(random: Random, questionNumber: number): MathQuestion {
  const pictures = random() < 0.5 ? FRUIT : SHAPES
  if (questionNumber < FIRST_MIXED_QUESTION) return sameThing(random, pictures, 5)
  if (questionNumber < FIRST_LETTER_QUESTION) return mixedThings(random, pictures)
  if (questionNumber < FIRST_LONG_SUM) return random() < 0.5 ? sameThing(random, LETTERS, 6) : mixedThings(random, LETTERS)
  return mixedThings(random, random() < 0.5 ? pictures : LETTERS, 4)
}
