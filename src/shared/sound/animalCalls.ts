import type { AnimalCall, SoundEffect } from './SoundPlayer'

/** One note of an animal's call: a wobbling tone that glides in pitch and is shaped by a throat-like filter. */
interface Voice {
  /** Seconds after the call begins. */
  readonly at: number
  readonly seconds: number
  readonly wave: OscillatorType
  /** [fraction of the note, hertz] points the pitch glides through. */
  readonly pitch: readonly (readonly [number, number])[]
  /** [fraction of the note, hertz] points the filter glides through: the mouth opening and closing. */
  readonly mouth: readonly (readonly [number, number])[]
  readonly filter: BiquadFilterType
  readonly gain: number
  /** A wobble in the pitch (vibrato) or the loudness (tremolo), as a rate in hertz and how deep it goes. */
  readonly vibrato?: Wobble
  readonly tremolo?: Wobble
}

interface Wobble {
  readonly rate: number
  readonly depth: number
}

const burst = (at: number, voice: Omit<Voice, 'at'>): Voice => ({ at, ...voice })
const repeat = (times: number, every: number, voice: Omit<Voice, 'at'>): Voice[] => Array.from({ length: times }, (_, i) => burst(i * every, voice))

/** Every call is synthesised, so there are no recordings and nothing to download. Calls are kept soft and brief. */
export const ANIMAL_CALLS: Record<AnimalCall, readonly Voice[]> = {
  moo: [
    burst(0, {
      seconds: 1.9,
      wave: 'sawtooth',
      pitch: [[0, 120], [0.25, 140], [0.8, 125], [1, 95]],
      mouth: [[0, 300], [0.3, 700], [0.7, 600], [1, 250]],
      filter: 'lowpass',
      gain: 0.45,
      vibrato: { rate: 5, depth: 3 },
    }),
  ],
  meow: [
    burst(0, {
      seconds: 0.8,
      wave: 'sawtooth',
      pitch: [[0, 420], [0.3, 780], [1, 480]],
      mouth: [[0, 900], [0.35, 2200], [1, 1000]],
      filter: 'bandpass',
      gain: 0.35,
      vibrato: { rate: 6, depth: 10 },
    }),
  ],
  woof: repeat(2, 0.28, {
    seconds: 0.18,
    wave: 'sawtooth',
    pitch: [[0, 260], [1, 150]],
    mouth: [[0, 1400], [1, 500]],
    filter: 'lowpass',
    gain: 0.5,
  }),
  oink: repeat(2, 0.3, {
    seconds: 0.22,
    wave: 'sawtooth',
    pitch: [[0, 170], [0.4, 230], [1, 120]],
    mouth: [[0, 900], [1, 500]],
    filter: 'bandpass',
    gain: 0.4,
    vibrato: { rate: 28, depth: 25 },
  }),
  buzz: [
    burst(0, {
      seconds: 1,
      wave: 'sawtooth',
      pitch: [[0, 210], [0.5, 240], [1, 200]],
      mouth: [[0, 900], [1, 900]],
      filter: 'bandpass',
      gain: 0.3,
      tremolo: { rate: 40, depth: 0.6 },
    }),
  ],
  cluck: repeat(3, 0.16, {
    seconds: 0.1,
    wave: 'square',
    pitch: [[0, 620], [1, 420]],
    mouth: [[0, 1400], [1, 800]],
    filter: 'bandpass',
    gain: 0.25,
  }),
  ribbit: repeat(2, 0.3, {
    seconds: 0.22,
    wave: 'sawtooth',
    pitch: [[0, 130], [1, 110]],
    mouth: [[0, 400], [0.5, 900], [1, 400]],
    filter: 'lowpass',
    gain: 0.45,
    tremolo: { rate: 45, depth: 0.7 },
  }),
  quack: repeat(2, 0.3, {
    seconds: 0.2,
    wave: 'sawtooth',
    pitch: [[0, 380], [1, 280]],
    mouth: [[0, 1500], [1, 1000]],
    filter: 'bandpass',
    gain: 0.35,
    vibrato: { rate: 30, depth: 12 },
  }),
  tweet: repeat(3, 0.17, {
    seconds: 0.12,
    wave: 'sine',
    pitch: [[0, 2200], [0.5, 3200], [1, 2600]],
    mouth: [[0, 3000], [1, 3000]],
    filter: 'lowpass',
    gain: 0.25,
  }),
  squeak: repeat(2, 0.18, {
    seconds: 0.12,
    wave: 'sine',
    pitch: [[0, 1800], [1, 2700]],
    mouth: [[0, 3500], [1, 3500]],
    filter: 'lowpass',
    gain: 0.22,
  }),
  neigh: [
    burst(0, {
      seconds: 1.3,
      wave: 'sawtooth',
      pitch: [[0, 420], [0.2, 900], [0.6, 700], [1, 300]],
      mouth: [[0, 1200], [0.3, 2000], [1, 700]],
      filter: 'bandpass',
      gain: 0.3,
      vibrato: { rate: 14, depth: 30 },
    }),
  ],
  baa: [
    burst(0, {
      seconds: 0.9,
      wave: 'sawtooth',
      pitch: [[0, 330], [0.5, 300], [1, 260]],
      mouth: [[0, 1100], [1, 900]],
      filter: 'bandpass',
      gain: 0.35,
      vibrato: { rate: 24, depth: 20 },
    }),
  ],
  growl: [
    burst(0, {
      seconds: 1,
      wave: 'sawtooth',
      pitch: [[0, 90], [0.4, 80], [1, 60]],
      mouth: [[0, 300], [0.4, 500], [1, 250]],
      filter: 'lowpass',
      gain: 0.45,
      tremolo: { rate: 26, depth: 0.5 },
    }),
  ],
}

export function isAnimalCall(effect: SoundEffect): effect is AnimalCall {
  return effect in ANIMAL_CALLS
}

export function scheduleAnimalCall(context: BaseAudioContext, destination: AudioNode, call: AnimalCall): void {
  const start = context.currentTime
  for (const voice of ANIMAL_CALLS[call]) sing(context, destination, start + voice.at, voice)
}

function sing(context: BaseAudioContext, destination: AudioNode, at: number, voice: Voice): void {
  const end = at + voice.seconds
  const tone = context.createOscillator()
  tone.type = voice.wave
  glide(tone.frequency, at, voice.seconds, voice.pitch)

  const mouth = context.createBiquadFilter()
  mouth.type = voice.filter
  mouth.Q.value = voice.filter === 'bandpass' ? 4 : 1
  glide(mouth.frequency, at, voice.seconds, voice.mouth)

  const loudness = context.createGain()
  loudness.gain.setValueAtTime(0.0001, at)
  loudness.gain.exponentialRampToValueAtTime(voice.gain, at + Math.min(0.05, voice.seconds / 4))
  loudness.gain.exponentialRampToValueAtTime(0.0001, end)

  if (voice.vibrato) wobble(context, tone.frequency, voice.vibrato, at, end)
  if (voice.tremolo) {
    const flutter = context.createGain()
    flutter.gain.value = 1 - voice.tremolo.depth / 2
    wobble(context, flutter.gain, { rate: voice.tremolo.rate, depth: voice.tremolo.depth / 2 }, at, end)
    tone.connect(flutter).connect(mouth)
  } else {
    tone.connect(mouth)
  }
  mouth.connect(loudness).connect(destination)
  tone.start(at)
  tone.stop(end + 0.05)
}

function glide(param: AudioParam, at: number, seconds: number, points: readonly (readonly [number, number])[]): void {
  param.setValueAtTime(points[0][1], at)
  for (const [fraction, value] of points.slice(1)) param.linearRampToValueAtTime(value, at + fraction * seconds)
}

function wobble(context: BaseAudioContext, target: AudioParam, { rate, depth }: Wobble, at: number, end: number): void {
  const lfo = context.createOscillator()
  lfo.frequency.value = rate
  const amount = context.createGain()
  amount.gain.value = depth
  lfo.connect(amount).connect(target)
  lfo.start(at)
  lfo.stop(end + 0.05)
}
