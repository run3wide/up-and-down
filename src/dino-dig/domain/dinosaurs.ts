export type BoneKind = 'skull' | 'neck' | 'ribs' | 'arm' | 'leg' | 'tail' | 'plates'

/** Where a bone belongs on the finished skeleton, as a box on a 100 x 60 stage. */
export interface Bone {
  readonly id: string
  readonly kind: BoneKind
  readonly label: string
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface Dinosaur {
  readonly id: string
  readonly name: string
  readonly bones: readonly Bone[]
}

export const STAGE = { width: 100, height: 60 } as const

const bone = (id: string, kind: BoneKind, label: string, x: number, y: number, width: number, height: number): Bone => ({
  id,
  kind,
  label,
  x,
  y,
  width,
  height,
})

/** Every skeleton faces left, with the tail trailing off to the right. */
export const DINOSAURS: readonly Dinosaur[] = [
  {
    id: 't-rex',
    name: 'T-Rex',
    bones: [
      bone('skull', 'skull', 'skull', 4, 6, 28, 20),
      bone('ribs', 'ribs', 'ribs', 30, 14, 26, 20),
      bone('arm', 'arm', 'arm', 30, 30, 9, 10),
      bone('leg', 'leg', 'leg', 40, 32, 18, 26),
      bone('tail', 'tail', 'tail', 50, 14, 46, 16),
    ],
  },
  {
    id: 'triceratops',
    name: 'Triceratops',
    bones: [
      bone('skull', 'skull', 'skull', 2, 8, 32, 28),
      bone('ribs', 'ribs', 'ribs', 32, 14, 30, 22),
      bone('front-leg', 'leg', 'front leg', 32, 34, 12, 24),
      bone('back-leg', 'leg', 'back leg', 52, 34, 12, 24),
      bone('tail', 'tail', 'tail', 58, 22, 38, 12),
    ],
  },
  {
    id: 'stegosaurus',
    name: 'Stegosaurus',
    bones: [
      bone('skull', 'skull', 'skull', 2, 28, 20, 14),
      bone('plates', 'plates', 'back plates', 20, 4, 44, 18),
      bone('ribs', 'ribs', 'ribs', 22, 20, 40, 18),
      bone('front-leg', 'leg', 'front leg', 22, 36, 12, 22),
      bone('back-leg', 'leg', 'back leg', 50, 36, 12, 22),
      bone('tail', 'tail', 'tail', 58, 24, 38, 14),
    ],
  },
  {
    id: 'brachiosaurus',
    name: 'Brachiosaurus',
    bones: [
      bone('skull', 'skull', 'skull', 4, 2, 14, 10),
      bone('neck', 'neck', 'neck', 8, 10, 24, 28),
      bone('ribs', 'ribs', 'ribs', 30, 24, 34, 18),
      bone('front-leg', 'leg', 'front leg', 30, 40, 12, 18),
      bone('back-leg', 'leg', 'back leg', 52, 40, 12, 18),
      bone('tail', 'tail', 'tail', 60, 30, 36, 12),
    ],
  },
]
