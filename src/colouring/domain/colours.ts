export interface Colour {
  readonly id: string
  readonly name: string
  readonly hex: string
}

export const COLOURS: readonly Colour[] = [
  { id: 'red', name: 'Red', hex: '#e63946' },
  { id: 'orange', name: 'Orange', hex: '#f4802a' },
  { id: 'yellow', name: 'Yellow', hex: '#ffd23f' },
  { id: 'green', name: 'Green', hex: '#3bb54a' },
  { id: 'teal', name: 'Teal', hex: '#1fb5a8' },
  { id: 'blue', name: 'Blue', hex: '#3a86ff' },
  { id: 'purple', name: 'Purple', hex: '#8e5bd9' },
  { id: 'pink', name: 'Pink', hex: '#ff7eb6' },
  { id: 'brown', name: 'Brown', hex: '#8b5a2b' },
  { id: 'grey', name: 'Grey', hex: '#9aa0a6' },
  { id: 'black', name: 'Black', hex: '#2b2b33' },
  { id: 'white', name: 'White', hex: '#ffffff' },
]
