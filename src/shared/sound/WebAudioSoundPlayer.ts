import { scheduleEruption } from './eruptionSound'
import type { SoundEffect, SoundPlayer } from './SoundPlayer'
import roarClip from './trexRoar.wav?inline'
import victoryRoarClip from './trexVictoryRoar.wav?inline'

const CLIPS: Partial<Record<SoundEffect, string>> = { roar: roarClip, victoryRoar: victoryRoarClip }

/**
 * Plays sounds with Web Audio. The eruption is synthesised; the dino roars are small CC0 clips (see CREDITS.md)
 * bundled into the app as data URLs, so the game still makes no network calls.
 */
export class WebAudioSoundPlayer implements SoundPlayer {
  private context: AudioContext | null = null
  private output: AudioNode | null = null
  private readonly clips = new Map<SoundEffect, Promise<AudioBuffer>>()

  unlock(): void {
    const context = this.ensureContext()
    if (context?.state === 'suspended') void context.resume()
    if (context) for (const effect of Object.keys(CLIPS) as SoundEffect[]) void this.clip(context, effect)
  }

  play(effect: SoundEffect): void {
    const context = this.ensureContext()
    if (!context || !this.output || context.state !== 'running') return
    if (effect === 'eruption') scheduleEruption(context, this.output)
    else void this.playClip(context, this.output, effect)
  }

  private async playClip(context: AudioContext, output: AudioNode, effect: SoundEffect): Promise<void> {
    try {
      const source = context.createBufferSource()
      source.buffer = await this.clip(context, effect)
      source.connect(output)
      source.start()
    } catch {
      // A clip that won't decode is just a missing sound: the game carries on.
    }
  }

  /** Decoded once, on first use, so repeat roars play instantly. */
  private clip(context: AudioContext, effect: SoundEffect): Promise<AudioBuffer> {
    const cached = this.clips.get(effect)
    if (cached) return cached
    const decoded = fetch(CLIPS[effect] ?? '')
      .then((response) => response.arrayBuffer())
      .then((bytes) => context.decodeAudioData(bytes))
    this.clips.set(effect, decoded)
    return decoded
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
