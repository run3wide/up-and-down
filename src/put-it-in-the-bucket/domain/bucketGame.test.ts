import { describe, expect, it } from 'vitest'
import { BucketGame } from './bucketGame'
import type { Bucket, Item } from './items'

const animals: Bucket = { id: 'animals', emoji: '🐶', label: 'Animals', phrase: 'an animal' }
const vehicles: Bucket = { id: 'vehicles', emoji: '🚚', label: 'Vehicles', phrase: 'a vehicle' }
const cow: Item = { name: 'cow', emoji: '🐮', bucket: 'animals' }
const bus: Item = { name: 'bus', emoji: '🚌', bucket: 'vehicles' }
const pig: Item = { name: 'pig', emoji: '🐷', bucket: 'animals' }

/** With every random value at 0 the deck is dealt in the order it was given. */
const inOrder = () => 0

function newGame(items: readonly Item[] = [cow, bus, pig]) {
  return new BucketGame([animals, vehicles], items, inOrder)
}

describe('BucketGame', () => {
  it('starts with an item at the top and every bucket below', () => {
    const snapshot = newGame().snapshot()

    expect(snapshot.item).toEqual(cow)
    expect(snapshot.buckets).toEqual([animals, vehicles])
    expect(snapshot.sorted).toBe(0)
  })

  it('sorts an item into its own bucket, scores, and brings the next item', () => {
    const game = newGame()

    const events = game.drop('animals')

    expect(events).toEqual([{ type: 'sorted', item: cow, bucket: animals }])
    expect(game.snapshot().sorted).toBe(1)
    expect(game.snapshot().item).toEqual(bus)
  })

  it('sends an item dropped in the wrong bucket back, at no cost', () => {
    const game = newGame()

    const events = game.drop('vehicles')

    expect(events).toEqual([{ type: 'wrongBucket', item: cow, bucket: vehicles }])
    expect(game.snapshot().sorted).toBe(0)
    expect(game.snapshot().item).toEqual(cow)
  })

  it('ignores a bucket that is not on the table', () => {
    expect(newGame().drop('fruit')).toEqual([])
  })

  it('never deals the same item twice in a row when the deck runs out', () => {
    const game = newGame([cow, bus])

    const dealt = [game.snapshot().item]
    for (let turn = 0; turn < 6; turn++) {
      game.drop(game.snapshot().item.bucket)
      dealt.push(game.snapshot().item)
    }

    dealt.slice(1).forEach((item, turn) => expect(item).not.toBe(dealt[turn]))
  })

  it('shuffles the deck with the random source it is given', () => {
    const lastFirst = () => 0.99
    const game = new BucketGame([animals, vehicles], [cow, bus, pig], lastFirst)

    expect(game.snapshot().item).not.toEqual(cow)
  })
})
