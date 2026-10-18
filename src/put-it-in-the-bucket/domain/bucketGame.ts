import type { Bucket, Item } from './items'

export type BucketEvent =
  | { type: 'sorted'; item: Item; bucket: Bucket }
  | { type: 'wrongBucket'; item: Item; bucket: Bucket }

export interface BucketSnapshot {
  readonly item: Item
  readonly buckets: readonly Bucket[]
  readonly sorted: number
}

export class BucketGame {
  private readonly buckets: readonly Bucket[]
  private readonly items: readonly Item[]
  private readonly random: () => number
  private deck: Item[] = []
  private item: Item
  private sorted = 0

  constructor(buckets: readonly Bucket[], items: readonly Item[], random: () => number) {
    this.buckets = buckets
    this.items = items
    this.random = random
    this.item = this.takeItem()
  }

  /** A wrong bucket costs nothing: the item stays at the top for another go. */
  drop(bucketId: string): BucketEvent[] {
    const bucket = this.buckets.find((candidate) => candidate.id === bucketId)
    if (!bucket) return []
    if (this.item.bucket !== bucket.id) return [{ type: 'wrongBucket', item: this.item, bucket }]
    const sortedItem = this.item
    this.sorted += 1
    this.item = this.takeItem()
    return [{ type: 'sorted', item: sortedItem, bucket }]
  }

  snapshot(): BucketSnapshot {
    return { item: this.item, buckets: this.buckets, sorted: this.sorted }
  }

  private takeItem(): Item {
    if (this.deck.length === 0) this.deck = this.freshDeck()
    return this.deck.shift()!
  }

  /** The first card of a new deck is never the one just sorted. */
  private freshDeck(): Item[] {
    const deck = this.shuffled(this.items)
    const justSorted = this.item
    if (deck.length > 1 && deck[0] === justSorted) [deck[0], deck[1]] = [deck[1], deck[0]]
    return deck
  }

  private shuffled<T>(items: readonly T[]): T[] {
    const result = [...items]
    for (let i = 0; i < result.length - 1; i++) {
      const j = i + Math.floor(this.random() * (result.length - i))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}
