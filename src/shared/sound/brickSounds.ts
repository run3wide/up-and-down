/** Soft, short sounds for building with bricks. All synthesised, so they need no recordings. */

interface Tone {
  at: number
  from: number
  to: number
  seconds: number
  gain: number
  type: OscillatorType
}

function tone(context: BaseAudioContext, destination: AudioNode, { at, from, to, seconds, gain, type }: Tone): void {
  const oscillator = context.createOscillator()
  const envelope = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(from, at)
  oscillator.frequency.exponentialRampToValueAtTime(to, at + seconds)
  envelope.gain.setValueAtTime(0.0001, at)
  envelope.gain.exponentialRampToValueAtTime(gain, at + 0.006)
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + seconds)
  oscillator.connect(envelope).connect(destination)
  oscillator.start(at)
  oscillator.stop(at + seconds + 0.05)
}

/** A brick clicking onto the studs: a quick, dropping "tock". */
export function scheduleBrickSnap(context: BaseAudioContext, destination: AudioNode): void {
  const t = context.currentTime
  tone(context, destination, { at: t, from: 900, to: 420, seconds: 0.09, gain: 0.5, type: 'sine' })
  tone(context, destination, { at: t, from: 1800, to: 900, seconds: 0.04, gain: 0.15, type: 'triangle' })
}

/** A brick coming off: a little rising "pop". */
export function scheduleBrickPop(context: BaseAudioContext, destination: AudioNode): void {
  tone(context, destination, { at: context.currentTime, from: 380, to: 900, seconds: 0.12, gain: 0.4, type: 'sine' })
}

const FANFARE_NOTES = [523, 659, 784, 1047]
const FANFARE_STEP_SECONDS = 0.12

/** Four rising notes for finishing a picture. */
export function scheduleBuiltIt(context: BaseAudioContext, destination: AudioNode): void {
  const t = context.currentTime
  FANFARE_NOTES.forEach((pitch, step) => tone(context, destination, { at: t + step * FANFARE_STEP_SECONDS, from: pitch, to: pitch, seconds: 0.35, gain: 0.3, type: 'triangle' }))
}
