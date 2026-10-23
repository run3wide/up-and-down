import { FRUIT, LETTERS, SHAPES, likeThingsTerms, type Term } from '../../shared/likeThings'
import type { GroupQuiz } from './groupGame'

type Random = () => number

const BIGGEST_COUNT = 5
const FIRST_FOUR_TERM_SUM = 3
const FIRST_LETTER_SUM = 5
const FIRST_FOUR_LETTER_SUM = 7
const FIRST_THREE_KINDS_SUM = 9

/** Three terms in fruit or shapes, then four, then the same in letters, then five terms of three kinds: each step a little more to sort. */
export function groupQuiz(random: Random): GroupQuiz {
  return { ask: (questionNumber) => buildTerms(random, questionNumber) }
}

function buildTerms(random: Random, questionNumber: number): Term[] {
  const pictures = random() < 0.5 ? FRUIT : SHAPES
  if (questionNumber < FIRST_FOUR_TERM_SUM) return likeThingsTerms(random, pictures, 2, 3, BIGGEST_COUNT)
  if (questionNumber < FIRST_LETTER_SUM) return likeThingsTerms(random, pictures, 2, 4, BIGGEST_COUNT)
  if (questionNumber < FIRST_FOUR_LETTER_SUM) return likeThingsTerms(random, LETTERS, 2, 3, BIGGEST_COUNT)
  if (questionNumber < FIRST_THREE_KINDS_SUM) return likeThingsTerms(random, LETTERS, 2, 4, BIGGEST_COUNT)
  return likeThingsTerms(random, random() < 0.5 ? pictures : LETTERS, 3, 5, BIGGEST_COUNT)
}
