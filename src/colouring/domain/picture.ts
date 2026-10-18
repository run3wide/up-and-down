import { COLOURS } from './colours'
import type { Template } from './templates'

export type Fills = Readonly<Record<string, string>>

export type PictureEvent = { type: 'filled'; region: string; colour: string } | { type: 'finished' }

export interface PictureSnapshot {
  readonly template: Template
  readonly fills: Fills
  readonly finished: boolean
}

/** A template being coloured in. Every part starts blank; any part can be recoloured as often as you like. */
export class Picture {
  private readonly template: Template
  private fills: Fills
  private history: Fills[] = []

  constructor(template: Template, saved: Fills = {}) {
    this.template = template
    this.fills = Object.fromEntries(Object.entries(saved).filter(([region, colour]) => this.knows(region, colour)))
  }

  fill(region: string, colour: string): PictureEvent[] {
    if (!this.knows(region, colour) || this.fills[region] === colour) return []
    const wasFinished = this.finished()
    this.remember()
    this.fills = { ...this.fills, [region]: colour }
    const events: PictureEvent[] = [{ type: 'filled', region, colour }]
    if (!wasFinished && this.finished()) events.push({ type: 'finished' })
    return events
  }

  undo() {
    this.fills = this.history.pop() ?? this.fills
  }

  clear() {
    if (Object.keys(this.fills).length === 0) return
    this.remember()
    this.fills = {}
  }

  snapshot(): PictureSnapshot {
    return { template: this.template, fills: this.fills, finished: this.finished() }
  }

  private knows(region: string, colour: string) {
    return this.template.regions.some(({ id }) => id === region) && COLOURS.some(({ id }) => id === colour)
  }

  private finished() {
    return this.template.regions.every(({ id }) => id in this.fills)
  }

  private remember() {
    this.history.push(this.fills)
  }
}
