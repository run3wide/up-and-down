export interface Item {
  readonly name: string
  readonly face: string
}

/** A group of things that are alike, e.g. fruits. `plural` is what we call them out loud: "Both are fruits!" */
export interface Kind {
  readonly id: string
  readonly plural: string
  readonly items: readonly Item[]
}

const item = (name: string, face: string): Item => ({ name, face })

export const KINDS: readonly Kind[] = [
  { id: 'fruit', plural: 'fruits', items: [item('Apple', '🍎'), item('Banana', '🍌'), item('Grapes', '🍇'), item('Strawberry', '🍓'), item('Orange', '🍊')] },
  { id: 'animal', plural: 'animals', items: [item('Cat', '🐱'), item('Dog', '🐶'), item('Cow', '🐮'), item('Frog', '🐸'), item('Duck', '🦆')] },
  { id: 'number', plural: 'numbers', items: [item('One', '1'), item('Two', '2'), item('Three', '3'), item('Four', '4'), item('Five', '5')] },
  { id: 'vehicle', plural: 'vehicles', items: [item('Car', '🚗'), item('Bus', '🚌'), item('Train', '🚂'), item('Boat', '⛵'), item('Plane', '✈️')] },
  { id: 'shape', plural: 'shapes', items: [item('Circle', '⚪'), item('Square', '🟦'), item('Triangle', '🔺'), item('Diamond', '🔶'), item('Star', '⭐')] },
  { id: 'weather', plural: 'weather', items: [item('Sun', '☀️'), item('Rain', '🌧️'), item('Snow', '❄️'), item('Rainbow', '🌈'), item('Cloud', '☁️')] },
  { id: 'toy', plural: 'toys', items: [item('Ball', '⚽'), item('Teddy', '🧸'), item('Kite', '🪁'), item('Balloon', '🎈'), item('Drum', '🥁')] },
  { id: 'instrument', plural: 'instruments', items: [item('Guitar', '🎸'), item('Piano', '🎹'), item('Trumpet', '🎺'), item('Violin', '🎻'), item('Saxophone', '🎷')] },
  { id: 'vegetable', plural: 'vegetables', items: [item('Carrot', '🥕'), item('Corn', '🌽'), item('Broccoli', '🥦'), item('Potato', '🥔'), item('Cucumber', '🥒')] },
  { id: 'colour', plural: 'colours', items: [item('Red', '🔴'), item('Blue', '🔵'), item('Green', '🟢'), item('Yellow', '🟡'), item('Purple', '🟣')] },
  { id: 'treat', plural: 'treats', items: [item('Cake', '🎂'), item('Ice cream', '🍦'), item('Cookie', '🍪'), item('Doughnut', '🍩'), item('Lollipop', '🍭')] },
  { id: 'clothes', plural: 'clothes', items: [item('Shirt', '👕'), item('Trousers', '👖'), item('Socks', '🧦'), item('Hat', '🧢'), item('Dress', '👗')] },
]
