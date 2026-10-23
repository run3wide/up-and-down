/** The things that sums are about: "3x" is a count of one kind of thing. */
export interface Term {
  readonly count: number
  readonly symbol: string
}

export const FRUIT = ['🍍', '🍌', '🍇', '🍓', '🍎']
export const SHAPES = ['⭐', '🔺', '🟦', '🟢']
export const LETTERS = ['x', 'y', 'p', 'z']

export const show = ({ count, symbol }: Term): string => `${count}${symbol}`

type Random = () => number

export function shuffle<T>(random: Random, items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** `kinds` different things spread over `termCount` terms, counts 1 to `biggestCount`, shuffled so like things are not side by side. */
export function likeThingsTerms(random: Random, symbols: readonly string[], kinds: number, termCount: number, biggestCount: number): Term[] {
  const things = shuffle(random, symbols).slice(0, kinds)
  const termsFor = (symbol: string, index: number): Term[] => {
    const howMany = Math.floor(termCount / kinds) + (index < termCount % kinds ? 1 : 0)
    return Array.from({ length: howMany }, () => ({ symbol, count: 1 + Math.floor(random() * biggestCount) }))
  }
  return shuffle(random, things.flatMap(termsFor))
}
