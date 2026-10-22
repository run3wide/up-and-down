import type { Sum, SumQuiz, Term } from './sum'

type Random = () => number

const FRUIT = ['🍍', '🍌', '🍇', '🍓', '🍎']
const SHAPES = ['⭐', '🔺', '🟦', '🟢']
const LETTERS = ['x', 'y', 'p', 'z']
const FIRST_MIXED_QUESTION = 3
const FIRST_LETTER_QUESTION = 5
const FIRST_LONG_SUM = 7
const BIGGEST_COUNT = 5
const SPARE_COUNTS = 2

/** Fruit or shapes at first, then letters, then sums as long as 1x + 2y + 3x + 1y: the baker grows into it. */
export function cakeQuiz(random: Random): SumQuiz {
  return { ask: (questionNumber) => buildSum(random, questionNumber) }
}

function buildSum(random: Random, questionNumber: number): Sum {
  const pictures = random() < 0.5 ? FRUIT : SHAPES
  if (questionNumber < FIRST_MIXED_QUESTION) return sumOf(random, pictures, 1, 2)
  if (questionNumber < FIRST_LETTER_QUESTION) return sumOf(random, pictures, 2, 3)
  if (questionNumber < FIRST_LONG_SUM) return random() < 0.5 ? sumOf(random, LETTERS, 1, 2) : sumOf(random, LETTERS, 2, 3)
  return sumOf(random, random() < 0.5 ? pictures : LETTERS, 2, 4)
}

/** `kinds` different things spread over `termCount` terms, shuffled so like things are not side by side. */
function sumOf(random: Random, symbols: readonly string[], kinds: number, termCount: number): Sum {
  const things = shuffle(random, symbols).slice(0, kinds)
  const terms = shuffle(random, things.flatMap((symbol, index) => termsFor(random, symbol, index, kinds, termCount)))
  const answer = things.map((symbol) => ({ symbol, count: terms.filter((term) => term.symbol === symbol).reduce((total, term) => total + term.count, 0) }))
  const everything = terms.reduce((total, term) => total + term.count, 0)
  const spareSymbol = shuffle(random, symbols.filter((symbol) => !things.includes(symbol)))[0]
  return {
    prompt: `${terms.map(show).join(' + ')} =`,
    answer,
    counts: shuffle(random, [...answer.map((term) => term.count), ...spareCounts(random, answer, everything)]),
    symbols: shuffle(random, [...things, spareSymbol]),
    explanation: `Keep ${things.join(' with ')} with its own kind: only like things go together!`,
  }
}

/** The first thing gets the extra term when the terms do not split evenly, e.g. 2x + 1x + 3y. */
function termsFor(random: Random, symbol: string, index: number, kinds: number, termCount: number): Term[] {
  const howMany = Math.floor(termCount / kinds) + (index < termCount % kinds ? 1 : 0)
  return Array.from({ length: howMany }, () => ({ symbol, count: 1 + Math.floor(random() * BIGGEST_COUNT) }))
}

/** Tempting wrong numbers: lumping everything together, or a total that is out by one. */
function spareCounts(random: Random, answer: readonly Term[], everything: number): number[] {
  const needed = new Set(answer.map((term) => term.count))
  const tempting = [everything, ...answer.flatMap((term) => [term.count + 1, term.count - 1])].filter((count) => count >= 1 && !needed.has(count))
  const spares: number[] = []
  for (const count of shuffle(random, [...new Set(tempting)])) {
    if (spares.length < SPARE_COUNTS) spares.push(count)
  }
  for (let filler = 1; spares.length < SPARE_COUNTS; filler++) {
    if (!needed.has(filler) && !spares.includes(filler)) spares.push(filler)
  }
  return spares
}

const show = ({ count, symbol }: Term): string => `${count}${symbol}`

function shuffle<T>(random: Random, items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
