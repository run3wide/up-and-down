import { circle, ellipse, poly, rect, star, together } from './shapes'

/** One part of a picture that can be coloured, drawn in a 100x100 box. */
export interface Region {
  readonly id: string
  readonly name: string
  readonly path: string
}

export interface Template {
  readonly id: string
  readonly name: string
  readonly regions: readonly Region[]
  /** Outline details (eyes, spots, stitches) drawn over the colours; they are not coloured. */
  readonly lines: readonly string[]
}

const slug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')

const part = (name: string, path: string): Region => ({ id: slug(name), name, path })

const tRex: Template = {
  id: 't-rex',
  name: 'T-Rex',
  regions: [
    part('Sky', rect(0, 0, 100, 78)),
    part('Sun', circle(86, 14, 8)),
    part('Cloud', together(circle(18, 16, 6), circle(26, 14, 8), circle(35, 17, 5))),
    part('Hill', ellipse(15, 78, 28, 10)),
    part('Ground', rect(0, 78, 100, 22)),
    part('Tail', poly([4, 48], [30, 44], [36, 64], [22, 64], [10, 56])),
    part('Body', ellipse(46, 54, 20, 17)),
    part('Belly', ellipse(47, 63, 13, 7)),
    part('Back leg', ellipse(40, 70, 8, 12)),
    part('Foot', ellipse(41, 82, 9, 3.5)),
    part('Arm', ellipse(60, 62, 3.5, 7)),
    part('Neck', poly([52, 46], [60, 28], [72, 30], [70, 56], [60, 60])),
    part('Head', ellipse(76, 24, 14, 10)),
    part('Jaw', ellipse(78, 33, 12, 4.5)),
    part('Eye', circle(80, 21, 2.4)),
    part('Back spike 1', poly([30, 40], [33, 31], [38, 38])),
    part('Back spike 2', poly([38, 37], [43, 28], [47, 36])),
    part('Back spike 3', poly([46, 36], [51, 28], [55, 37])),
    part('Spot 1', circle(42, 50, 3.5)),
    part('Spot 2', circle(52, 46, 3)),
    part('Flower 1', circle(75, 90, 3.5)),
    part('Flower 2', circle(88, 86, 3.5)),
    part('Flower 3', circle(12, 92, 3.5)),
  ],
  lines: ['M70 31l2 4l2-4l2 4l2-4l2 4l2-4l2 4'],
}

const volcano: Template = {
  id: 'volcano',
  name: 'Volcano',
  regions: [
    part('Sky', rect(0, 0, 100, 82)),
    part('Sun', circle(88, 12, 7)),
    part('Cloud 1', together(circle(14, 14, 5), circle(21, 12, 7), circle(28, 15, 4.5))),
    part('Cloud 2', together(circle(70, 8, 4), circle(76, 6, 5), circle(82, 9, 3.5))),
    part('Left hill', ellipse(10, 80, 25, 12)),
    part('Right hill', ellipse(92, 80, 22, 10)),
    part('Ground', rect(0, 82, 100, 18)),
    part('Mountain', poly([6, 86], [38, 34], [62, 34], [94, 86])),
    part('Left side', poly([6, 86], [38, 34], [46, 34], [32, 86])),
    part('Right side', poly([94, 86], [62, 34], [54, 34], [68, 86])),
    part('Crater', ellipse(50, 34, 13, 4.5)),
    part('Lava', poly([44, 36], [56, 36], [60, 56], [54, 50], [52, 70], [47, 52], [41, 58])),
    part('Flame 1', poly([42, 31], [46, 14], [50, 31])),
    part('Flame 2', poly([47, 31], [54, 8], [61, 31])),
    part('Flame 3', poly([55, 31], [60, 16], [65, 31])),
    part('Lemon 1', circle(28, 22, 4.5)),
    part('Lemon 2', circle(74, 20, 4.5)),
    part('Lemon 3', circle(82, 38, 4)),
    part('Tree trunk', rect(8, 70, 4, 14)),
    part('Tree top', circle(10, 64, 8)),
    part('Bush', ellipse(86, 87, 8, 5)),
    part('Rock 1', ellipse(30, 90, 6, 4)),
    part('Rock 2', ellipse(64, 93, 7, 4)),
  ],
  lines: ['M46 30l2-4', 'M56 28l3-5'],
}

const raceCar: Template = {
  id: 'race-car',
  name: 'Race Car',
  regions: [
    part('Sky', rect(0, 0, 100, 58)),
    part('Sun', circle(14, 14, 8)),
    part('Cloud', together(circle(46, 14, 5), circle(53, 12, 7), circle(60, 15, 4.5))),
    part('Far hill', ellipse(30, 60, 40, 10)),
    part('Near hill', ellipse(85, 60, 30, 8)),
    part('Grass', rect(0, 58, 100, 10)),
    part('Tree trunk', rect(88, 40, 4, 20)),
    part('Tree top', circle(90, 36, 9)),
    part('Road', rect(0, 68, 100, 32)),
    part('Road line', together(rect(4, 88, 12, 2), rect(26, 88, 12, 2), rect(48, 88, 12, 2), rect(70, 88, 12, 2))),
    part('Cone', poly([4, 84], [8, 72], [12, 84])),
    part('Spoiler', poly([8, 46], [24, 46], [24, 50], [16, 50], [16, 58], [12, 58], [12, 50], [8, 50])),
    part('Car body', rect(10, 58, 82, 12)),
    part('Stripe', rect(10, 63, 82, 3)),
    part('Cabin', poly([28, 58], [34, 44], [58, 44], [68, 58])),
    part('Back window', poly([32, 56], [36, 47], [46, 47], [46, 56])),
    part('Front window', poly([49, 56], [49, 47], [57, 47], [64, 56])),
    part('Headlight', circle(88, 62, 2.8)),
    part('Back light', rect(10, 60, 4, 5)),
    part('Back wheel', circle(28, 72, 9)),
    part('Back hub', circle(28, 72, 4)),
    part('Front wheel', circle(74, 72, 9)),
    part('Front hub', circle(74, 72, 4)),
  ],
  lines: ['M46 57V68', 'M5 60l-3 0', 'M6 64l-4 0'],
}

const strawberry: Template = {
  id: 'strawberry',
  name: 'Strawberry',
  regions: [
    part('Sky', rect(0, 0, 100, 86)),
    part('Sun', circle(86, 14, 8)),
    part('Cloud', together(circle(14, 16, 5), circle(21, 14, 7), circle(28, 17, 4.5))),
    part('Table', rect(0, 86, 100, 14)),
    part('Berry', 'M50 90C20 76 14 52 18 40C22 28 38 30 50 34C62 30 78 28 82 40C86 52 80 76 50 90Z'),
    part('Stem', poly([48, 6], [52, 6], [52, 16], [48, 16])),
    part('Middle leaf', poly([50, 38], [42, 22], [50, 14], [58, 22])),
    part('Left leaf', poly([50, 38], [24, 26], [28, 40], [40, 42])),
    part('Right leaf', poly([50, 38], [76, 26], [72, 40], [60, 42])),
    part('Left eye', circle(41, 54, 4)),
    part('Right eye', circle(59, 54, 4)),
    part('Mouth', 'M43 62a7 7 0 0 0 14 0Z'),
    part('Seed 1', ellipse(32, 42, 3.5, 4.5)),
    part('Seed 2', ellipse(50, 44, 3.5, 4.5)),
    part('Seed 3', ellipse(68, 42, 3.5, 4.5)),
    part('Seed 4', ellipse(26, 56, 3.5, 4.5)),
    part('Seed 5', ellipse(74, 56, 3.5, 4.5)),
    part('Seed 6', ellipse(34, 68, 3.5, 4.5)),
    part('Seed 7', ellipse(66, 68, 3.5, 4.5)),
    part('Seed 8', ellipse(50, 76, 3.5, 4.5)),
    part('Flower 1', circle(12, 92, 4)),
    part('Flower 2', circle(88, 92, 4)),
  ],
  lines: [],
}

const rocket: Template = {
  id: 'rocket',
  name: 'Rocket',
  regions: [
    part('Space', rect(0, 0, 100, 100)),
    part('Planet ring', ellipse(18, 22, 14, 4)),
    part('Planet', circle(18, 22, 9)),
    part('Star 1', star(78, 14, 6)),
    part('Star 2', star(88, 36, 5)),
    part('Star 3', star(10, 50, 5)),
    part('Star 4', star(70, 56, 5)),
    part('Star 5', star(30, 8, 5)),
    part('Moon ground', ellipse(50, 104, 62, 18)),
    part('Crater 1', circle(20, 92, 4)),
    part('Crater 2', circle(80, 90, 4)),
    part('Left fin', poly([41, 48], [30, 66], [41, 62])),
    part('Right fin', poly([59, 48], [70, 66], [59, 62])),
    part('Flame', poly([44, 68], [56, 68], [50, 90])),
    part('Inner flame', poly([47, 68], [53, 68], [50, 80])),
    part('Nozzle', poly([44, 62], [56, 62], [53, 68], [47, 68])),
    part('Rocket body', rect(41, 28, 18, 34)),
    part('Nose', poly([50, 8], [41, 28], [59, 28])),
    part('Stripe', rect(41, 50, 18, 5)),
    part('Porthole', circle(50, 40, 7)),
    part('Window', circle(50, 40, 4.5)),
  ],
  lines: [],
}

export const TEMPLATES: readonly Template[] = [tRex, volcano, raceCar, strawberry, rocket]
