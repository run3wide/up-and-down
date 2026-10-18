import { scheduleBrickPop, scheduleBrickSnap, scheduleBuiltIt } from './brickSounds'
import { scheduleEruption } from './eruptionSound'
import type { SoundEffect, SoundPlayer } from './SoundPlayer'
import roarClip from './trexRoar.wav?inline'
import victoryRoarClip from './trexVictoryRoar.wav?inline'
import winnerClip from './winner.ogg?inline'
import baaClip from './animals/Baa.ogg?inline'
import bleatClip from './animals/Bleat.ogg?inline'
import buzzClip from './animals/Buzz.ogg?inline'
import meowClip from './animals/Meow.ogg?inline'
import mooClip from './animals/Moo.ogg?inline'
import peepClip from './animals/Peeps.ogg?inline'
import ribbitClip from './animals/Ribbit.mp3?inline'
import squealClip from './animals/Squeal.ogg?inline'
import whinnyClip from './animals/Whinny.ogg?inline'
import woofClip from './animals/Bark.ogg?inline'
import brayClip from './animals/Zebra.ogg?inline'
import cluckClip from './animals/Cluck.ogg?inline'
import lionClip from './animals/Lion.ogg?inline'
import quackClip from './animals/Quack.ogg?inline'
import squeakClip from './animals/Squeak.ogg?inline'
import tigerClip from './animals/Tiger.ogg?inline'
import yipClip from './animals/Fox.ogg?inline'

const CLIPS: Partial<Record<SoundEffect, string>> = {
  roar: roarClip,
  victoryRoar: victoryRoarClip,
  winner: winnerClip,
  moo: mooClip,
  baa: baaClip,
  bleat: bleatClip,
  meow: meowClip,
  woof: woofClip,
  oink: squealClip,
  neigh: whinnyClip,
  peep: peepClip,
  ribbit: ribbitClip,
  buzz: buzzClip,
  quack: quackClip,
  cluck: cluckClip,
  squeak: squeakClip,
  lion: lionClip,
  tiger: tigerClip,
  yip: yipClip,
  bray: brayClip,
}

/** Sounds that are made rather than recorded. */
const SYNTHESISED: Partial<Record<SoundEffect, (context: BaseAudioContext, destination: AudioNode) => void>> = {
  eruption: scheduleEruption,
  brickSnap: scheduleBrickSnap,
  brickPop: scheduleBrickPop,
  builtIt: scheduleBuiltIt,
}

/** A long recording only needs its first moments, which then fade out rather than stop with a click. */
const PLAY_SECONDS: Partial<Record<SoundEffect, number>> = { buzz: 1.5, bray: 2 }
const FADE_SECONDS = 0.25

/** Slowed down, the announcer's "Winner!" drops into a big dinosaur voice. */
const PLAYBACK_RATE: Partial<Record<SoundEffect, number>> = { winner: 0.7 }

/**
 * Plays sounds with Web Audio. The eruption and the brick sounds are synthesised; the dino roars, the "Winner!" and the animal calls are small CC0 or public-domain clips (see CREDITS.md)
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
    const synthesise = SYNTHESISED[effect]
    if (synthesise) synthesise(context, this.output)
    else void this.playClip(context, this.output, effect)
  }

  private async playClip(context: AudioContext, output: AudioNode, effect: SoundEffect): Promise<void> {
    try {
      const source = context.createBufferSource()
      source.buffer = await this.clip(context, effect)
      source.playbackRate.value = PLAYBACK_RATE[effect] ?? 1
      const seconds = PLAY_SECONDS[effect]
      if (seconds === undefined) {
        source.connect(output)
        source.start()
      } else {
        const fade = context.createGain()
        fade.gain.setValueAtTime(1, context.currentTime + seconds - FADE_SECONDS)
        fade.gain.linearRampToValueAtTime(0, context.currentTime + seconds)
        source.connect(fade).connect(output)
        source.start(0, 0, seconds)
      }
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
