import { describe, expect, it } from 'vitest'
import { ANIMAL_CALLS, isAnimalCall, scheduleAnimalCall } from './animalCalls'
import type { AnimalCall } from './SoundPlayer'

const calls = Object.keys(ANIMAL_CALLS) as AnimalCall[]

describe('animal calls', () => {
  it('knows which sound effects are animal calls', () => {
    expect(isAnimalCall('moo')).toBe(true)
    expect(isAnimalCall('eruption')).toBe(false)
  })

  it.each(calls)('%s is gentle, short and glides through a sensible pitch', (call) => {
    for (const voice of ANIMAL_CALLS[call]) {
      expect(voice.gain).toBeLessThanOrEqual(0.5)
      expect(voice.at + voice.seconds).toBeLessThan(2.5)
      expect(voice.pitch.every(([time]) => time >= 0 && time <= 1)).toBe(true)
      expect(voice.pitch.every(([, hertz]) => hertz >= 40 && hertz <= 4000)).toBe(true)
    }
  })

  it('lets a cow moo for a good long while', () => {
    const [moo] = ANIMAL_CALLS.moo
    expect(moo.seconds).toBeGreaterThanOrEqual(1.5)
  })

  it('schedules every voice of a call onto the destination', () => {
    const started: number[] = []
    const node = () => ({
      connect: (next: unknown) => next,
      gain: param(),
      frequency: param(),
      Q: param(),
      start: (at: number) => started.push(at),
      stop: () => {},
    })
    const param = () => ({ value: 0, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} })
    const context = { currentTime: 1, createOscillator: node, createGain: node, createBiquadFilter: node } as unknown as BaseAudioContext

    scheduleAnimalCall(context, {} as AudioNode, 'woof')

    expect(started).toHaveLength(ANIMAL_CALLS.woof.length)
    expect(Math.min(...started)).toBe(1)
  })
})
