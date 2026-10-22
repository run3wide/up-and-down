import type { MathQuestion, Quiz } from './quiz'

type Random = () => number

const FRUIT = ['🍍', '🍌', '🍇', '🍓', '🍎']
const LETTERS = ['x', 'y', 'p', 'z']
const FIRST_LETTER_QUESTION = 3
const FIRST_MIXED_QUESTION = 5

interface Term {
  readonly count: number
  readonly symbol: string
}

/** Pictures first, then letters, then two kinds of thing at once: the same idea at every step. */
export function buildQuestion(random: Random, questionNumber: number): MathQuestion {
  if (questionNumber < FIRST_LETTER_QUESTION) return sameThing(random, FRUIT, 5)
  if (questionNumber < FIRST_MIXED_QUESTION) return sameThing(random, LETTERS, 6)
  const roll = random()
  if (roll < 0.34) return sameThing(random, LETTERS, 6)
  return mixedThings(random, roll < 0.67 ? FRUIT : LETTERS)
}

export function mathQuiz(random: Random): Quiz {
  return {
    ask: (questionNumber) => buildQuestion(random, questionNumber),
  }
}

/** "2x + 6x =": the answer keeps its thing (8x); the traps are a bare 8 and 8 of something else. */
export function sameThing(random: Random, symbols: readonly string[], biggestCount: number): MathQuestion {
  const [thing, otherThing] = pickTwo(random, symbols)
  const first = between(random, 1, biggestCount)
  const second = between(random, 1, biggestCount)
  const sum = first + second
  return withShuffledOptions(random, {
    prompt: `${show({ count: first, symbol: thing })} + ${show({ count: second, symbol: thing })} =`,
    correct: show({ count: sum, symbol: thing }),
    wrong: [String(sum), show({ count: sum, symbol: otherThing })],
    explanation: `Same things go together: ${first}${thing} + ${second}${thing} = ${sum}${thing}`,
  })
}

/** "2x + 1x + 3y =": like things are grouped (3x + 3y); lumping everything under one thing is the trap. */
export function mixedThings(random: Random, symbols: readonly string[], termCount = 3): MathQuestion {
  const [thing, otherThing] = pickTwo(random, symbols)
  const otherCount = Math.floor(termCount / 2)
  const termsOf = (symbol: string, howMany: number): Term[] =>
    Array.from({ length: howMany }, () => ({ count: between(random, 1, 4), symbol }))
  const terms = shuffle(random, [...termsOf(thing, termCount - otherCount), ...termsOf(otherThing, otherCount)])
  const groups = groupLikeThings(terms)
  const everything = terms.reduce((total, term) => total + term.count, 0)
  return withShuffledOptions(random, {
    prompt: `${terms.map(show).join(' + ')} =`,
    correct: groups.map(show).join(' + '),
    wrong: [show({ count: everything, symbol: groups[0].symbol }), offByOne(random, groups)],
    explanation: `Keep ${groups[0].symbol} with ${groups[0].symbol} and ${groups[1].symbol} with ${groups[1].symbol} - you can't mix them together!`,
  })
}

function groupLikeThings(terms: readonly Term[]): Term[] {
  const totals = new Map<string, number>()
  for (const { count, symbol } of terms) totals.set(symbol, (totals.get(symbol) ?? 0) + count)
  return [...totals].map(([symbol, count]) => ({ symbol, count }))
}

/** A believable wrong answer: the right grouping, but one of the totals is out by one. */
function offByOne(random: Random, groups: readonly Term[]): string {
  const changed = Math.floor(random() * groups.length)
  return groups
    .map((group, index) => {
      if (index !== changed) return show(group)
      const count = group.count > 1 && random() < 0.5 ? group.count - 1 : group.count + 1
      return show({ ...group, count })
    })
    .join(' + ')
}

function withShuffledOptions(
  random: Random,
  { prompt, correct, wrong, explanation }: { prompt: string; correct: string; wrong: string[]; explanation: string },
): MathQuestion {
  const options = shuffle(random, [correct, ...wrong])
  return { prompt, options, correctIndex: options.indexOf(correct), explanation }
}

const show = ({ count, symbol }: Term): string => `${count}${symbol}`

function between(random: Random, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1))
}

function pickTwo(random: Random, symbols: readonly string[]): [string, string] {
  const [first, second] = shuffle(random, symbols)
  return [first, second]
}

function shuffle<T>(random: Random, items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
