/** A kind of brick in the tray: as many of each as you like. Bricks are one stud deep and 1–4 studs wide. */
export interface BrickKind {
  readonly id: string
  readonly width: number
  readonly colour: string
}

export const BRICK_KINDS: readonly BrickKind[] = [
  { id: 'red-2', width: 2, colour: '#e53935' },
  { id: 'blue-4', width: 4, colour: '#1e88e5' },
  { id: 'yellow-1', width: 1, colour: '#fdd835' },
  { id: 'green-3', width: 3, colour: '#43a047' },
  { id: 'orange-2', width: 2, colour: '#fb8c00' },
  { id: 'purple-3', width: 3, colour: '#8e24aa' },
  { id: 'pink-1', width: 1, colour: '#ec407a' },
  { id: 'teal-4', width: 4, colour: '#00897b' },
]
