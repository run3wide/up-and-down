/** Seconds from the start of the roar to its last breath. */
export const ROAR_SECONDS = 1.1

/**
 * Schedules a friendly cartoon dino roar onto `destination`: a growl that swells and bends down, with a
 * breathy rasp on top. Everything is synthesised, and it is kept short and soft so it cheers rather than startles.
 */
export function scheduleRoar(context: BaseAudioContext, destination: AudioNode): void {
  const t = context.currentTime
  growl(context, destination, { at: t, from: 190, to: 85, gain: 0.5, type: 'sawtooth' })
  growl(context, destination, { at: t, from: 95, to: 42, gain: 0.4, type: 'square' })
  rasp(context, destination, t)
}

function noiseBuffer(context: BaseAudioContext, seconds: number): AudioBuffer {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * seconds), context.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
  return buffer
}

/** Swells in, holds, then fades, so the roar opens its mouth rather than clicking on. */
function swell(context: BaseAudioContext, at: number, peak: number): GainNode {
  const gain = context.createGain()
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(peak, at + 0.18)
  gain.gain.setValueAtTime(peak, at + 0.5)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + ROAR_SECONDS)
  return gain
}

function growl(
  context: BaseAudioContext,
  destination: AudioNode,
  { at, from, to, gain, type }: { at: number; from: number; to: number; gain: number; type: OscillatorType },
): void {
  const oscillator = context.createOscillator()
  const lowpass = context.createBiquadFilter()
  const wobble = context.createOscillator()
  const wobbleDepth = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(from * 0.8, at)
  oscillator.frequency.exponentialRampToValueAtTime(from, at + 0.2)
  oscillator.frequency.exponentialRampToValueAtTime(to, at + ROAR_SECONDS)
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 700
  wobble.frequency.value = 24
  wobbleDepth.gain.value = from * 0.05
  wobble.connect(wobbleDepth).connect(oscillator.frequency)
  oscillator.connect(lowpass).connect(swell(context, at, gain)).connect(destination)
  oscillator.start(at)
  wobble.start(at)
  oscillator.stop(at + ROAR_SECONDS + 0.1)
  wobble.stop(at + ROAR_SECONDS + 0.1)
}

function rasp(context: BaseAudioContext, destination: AudioNode, at: number): void {
  const source = context.createBufferSource()
  const bandpass = context.createBiquadFilter()
  source.buffer = noiseBuffer(context, ROAR_SECONDS)
  bandpass.type = 'bandpass'
  bandpass.frequency.value = 600
  bandpass.Q.value = 0.8
  source.connect(bandpass).connect(swell(context, at, 0.25)).connect(destination)
  source.start(at)
}
