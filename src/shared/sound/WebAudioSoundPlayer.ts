import { scheduleEruption } from './eruptionSound'
import { scheduleRoar } from './roarSound'
import type { SoundEffect, SoundPlayer } from './SoundPlayer'

/** Plays synthesised sounds with Web Audio, so the game ships no audio files and makes no network calls. */
export class WebAudioSoundPlayer implements SoundPlayer {
  private context: AudioContext | null = null
  private output: AudioNode | null = null

  unlock(): void {
    const context = this.ensureContext()
    if (context?.state === 'suspended') void context.resume()
  }

  play(effect: SoundEffect): void {
    const context = this.ensureContext()
    if (!context || !this.output || context.state !== 'running') return
    if (effect === 'eruption') scheduleEruption(context, this.output)
    if (effect === 'roar') scheduleRoar(context, this.output)
  }

  private ensureContext(): AudioContext | null {
    if (this.context) return this.context
    try {
      this.context = new AudioContext()
      this.output = this.louderButSafe(this.context)
    } catch {
      // No audio support: the game is still fully playable.
    }
    return this.context
  }

  /** A compressor keeps a big, loud sound from clipping or hurting small ears. */
  private louderButSafe(context: AudioContext): AudioNode {
    const compressor = context.createDynamicsCompressor()
    compressor.threshold.value = -16
    compressor.ratio.value = 10
    compressor.attack.value = 0.003
    compressor.release.value = 0.25
    const master = context.createGain()
    master.gain.value = 0.7
    compressor.connect(master).connect(context.destination)
    return compressor
  }
}
