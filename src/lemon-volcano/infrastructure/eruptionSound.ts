/** Seconds from the first crack to the last rumble. */
export const ERUPTION_SECONDS = 4.4

/**
 * Schedules a thunderous eruption onto `destination`: a sharp crack, two deep booms, a long trembling rumble,
 * lava crackle and a hiss. Everything is synthesised, and the booms carry mid-range harmonics so tablet
 * speakers, which cannot reproduce true sub-bass, still thump.
 */
export function scheduleEruption(context: BaseAudioContext, destination: AudioNode): void {
  const t = context.currentTime
  crack(context, destination, t)
  boom(context, destination, { at: t, from: 120, to: 26, seconds: 2.2, gain: 1, type: 'sine' })
  boom(context, destination, { at: t, from: 82, to: 40, seconds: 2, gain: 0.55, type: 'sawtooth' })
  boom(context, destination, { at: t + 0.24, from: 96, to: 30, seconds: 2, gain: 0.8, type: 'sawtooth' })
  rumble(context, destination, t + 0.05)
  crackle(context, destination, t + 0.35)
  hiss(context, destination, t + 0.1)
}

function noiseBuffer(context: BaseAudioContext, seconds: number): AudioBuffer {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * seconds), context.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
  return buffer
}

function envelope(context: BaseAudioContext, at: number, peak: number, attack: number, seconds: number): GainNode {
  const gain = context.createGain()
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(peak, at + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds)
  return gain
}

/** Soft clipping adds harmonics, which is what makes a low boom audible on small speakers. */
function saturator(context: BaseAudioContext): WaveShaperNode {
  const shaper = context.createWaveShaper()
  const curve = new Float32Array(1024)
  for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh(((i / (curve.length - 1)) * 2 - 1) * 3)
  shaper.curve = curve
  return shaper
}

function crack(context: BaseAudioContext, destination: AudioNode, at: number): void {
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  source.buffer = noiseBuffer(context, 0.2)
  filter.type = 'highpass'
  filter.frequency.value = 800
  source.connect(filter).connect(envelope(context, at, 0.9, 0.002, 0.18)).connect(destination)
  source.start(at)
}

function boom(
  context: BaseAudioContext,
  destination: AudioNode,
  { at, from, to, seconds, gain, type }: { at: number; from: number; to: number; seconds: number; gain: number; type: OscillatorType },
): void {
  const oscillator = context.createOscillator()
  const lowpass = context.createBiquadFilter()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(from, at)
  oscillator.frequency.exponentialRampToValueAtTime(to, at + seconds * 0.8)
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 420
  oscillator.connect(lowpass).connect(saturator(context)).connect(envelope(context, at, gain, 0.01, seconds)).connect(destination)
  oscillator.start(at)
  oscillator.stop(at + seconds + 0.1)
}

/** Long, swelling, trembling low noise: the thunder. */
function rumble(context: BaseAudioContext, destination: AudioNode, at: number): void {
  const seconds = ERUPTION_SECONDS - 0.2
  const source = context.createBufferSource()
  const lowpass = context.createBiquadFilter()
  const swell = context.createGain()
  const tremolo = context.createOscillator()
  const tremoloDepth = context.createGain()
  source.buffer = noiseBuffer(context, seconds)
  lowpass.type = 'lowpass'
  lowpass.frequency.setValueAtTime(420, at)
  lowpass.frequency.exponentialRampToValueAtTime(110, at + seconds)
  swell.gain.setValueAtTime(0.0001, at)
  swell.gain.exponentialRampToValueAtTime(3.4, at + 0.35)
  swell.gain.setValueAtTime(3.4, at + 1.2)
  swell.gain.linearRampToValueAtTime(0, at + seconds)
  tremolo.frequency.value = 9
  tremoloDepth.gain.value = 0.35
  tremolo.connect(tremoloDepth).connect(swell.gain)
  source.connect(lowpass).connect(swell).connect(destination)
  source.start(at)
  tremolo.start(at)
  tremolo.stop(at + seconds)
}

function crackle(context: BaseAudioContext, destination: AudioNode, at: number): void {
  for (let i = 0; i < 26; i++) {
    const start = at + Math.random() * 2.6
    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    source.buffer = noiseBuffer(context, 0.03)
    filter.type = 'bandpass'
    filter.frequency.value = 1500 + Math.random() * 2500
    source.connect(filter).connect(envelope(context, start, 0.15 + Math.random() * 0.25, 0.002, 0.025)).connect(destination)
    source.start(start)
  }
}

function hiss(context: BaseAudioContext, destination: AudioNode, at: number): void {
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  source.buffer = noiseBuffer(context, 2)
  filter.type = 'highpass'
  filter.frequency.value = 1600
  source.connect(filter).connect(envelope(context, at, 0.22, 0.25, 1.9)).connect(destination)
  source.start(at)
}
