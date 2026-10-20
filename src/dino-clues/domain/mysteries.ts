/** Something Dino could want: the picture on a choice button, and what the answer is called. */
export interface Thing {
  readonly name: string
  readonly emoji: string
  /** How the answer is said in a sentence: "a banana", "the beach", "space". */
  readonly phrase: string
}

export interface Clue {
  readonly emoji: string
  readonly text: string
}

/** Three clues that all fit the answer. Each of the other choices breaks at least one of them, so no answer is arguable. */
export interface Mystery {
  readonly question: string
  readonly answer: Thing
  readonly choices: readonly Thing[]
  readonly clues: readonly Clue[]
}

export interface HidingPlace {
  readonly name: string
  readonly emoji: string
}

export const HIDING_PLACES: readonly HidingPlace[] = [
  { name: 'tree', emoji: '🌳' },
  { name: 'rock', emoji: '🪨' },
  { name: 'bucket', emoji: '🪣' },
  { name: 'tent', emoji: '⛺' },
  { name: 'basket', emoji: '🧺' },
  { name: 'cactus', emoji: '🌵' },
  { name: 'flowers', emoji: '🌼' },
  { name: 'hut', emoji: '🛖' },
]

const banana = { name: 'banana', emoji: '🍌', phrase: 'a banana' }
const apple = { name: 'apple', emoji: '🍎', phrase: 'an apple' }
const cookie = { name: 'cookie', emoji: '🍪', phrase: 'a cookie' }
const carrot = { name: 'carrot', emoji: '🥕', phrase: 'a carrot' }
const strawberry = { name: 'strawberry', emoji: '🍓', phrase: 'a strawberry' }
const iceCream = { name: 'ice cream', emoji: '🍦', phrase: 'ice cream' }
const fish = { name: 'fish', emoji: '🐟', phrase: 'a fish' }
const dog = { name: 'dog', emoji: '🐶', phrase: 'a dog' }
const bird = { name: 'bird', emoji: '🐦', phrase: 'a bird' }
const cat = { name: 'cat', emoji: '🐱', phrase: 'a cat' }
const rabbit = { name: 'rabbit', emoji: '🐰', phrase: 'a rabbit' }
const turtle = { name: 'turtle', emoji: '🐢', phrase: 'a turtle' }
const beach = { name: 'the beach', emoji: '🏖️', phrase: 'the beach' }
const farm = { name: 'the farm', emoji: '🚜', phrase: 'the farm' }
const space = { name: 'space', emoji: '🚀', phrase: 'space' }
const snow = { name: 'the snow', emoji: '❄️', phrase: 'the snow' }
const ball = { name: 'ball', emoji: '⚽', phrase: 'a ball' }
const kite = { name: 'kite', emoji: '🪁', phrase: 'a kite' }
const blocks = { name: 'blocks', emoji: '🧱', phrase: 'blocks' }

const SNACK = 'What does Dino want for a snack?'
const PET = 'What pet does Dino want?'
const PLACE = 'Where does Dino want to go?'
const TOY = 'What does Dino want to play with?'

export const MYSTERIES: readonly Mystery[] = [
  { question: SNACK, answer: banana, choices: [banana, apple, cookie], clues: [{ emoji: '🟡', text: 'It is yellow.' }, { emoji: '🐵', text: 'Monkeys love it.' }, { emoji: '🤲', text: 'You peel it before you eat it.' }] },
  { question: SNACK, answer: carrot, choices: [carrot, banana, cookie], clues: [{ emoji: '🟠', text: 'It is orange.' }, { emoji: '🌱', text: 'It grows under the ground.' }, { emoji: '🐰', text: 'Rabbits love it.' }] },
  { question: SNACK, answer: strawberry, choices: [strawberry, banana, carrot], clues: [{ emoji: '🔴', text: 'It is red.' }, { emoji: '🌰', text: 'It has tiny seeds on its skin.' }, { emoji: '🍰', text: 'You can put it on a cake.' }] },
  { question: SNACK, answer: iceCream, choices: [iceCream, apple, carrot], clues: [{ emoji: '🧊', text: 'It is very cold.' }, { emoji: '☀️', text: 'It melts in the sun.' }, { emoji: '🥄', text: 'You lick it or use a spoon.' }] },
  { question: PET, answer: fish, choices: [fish, dog, bird], clues: [{ emoji: '💧', text: 'It lives in water.' }, { emoji: '🌊', text: 'It has fins.' }, { emoji: '🫧', text: 'It blows bubbles.' }] },
  { question: PET, answer: bird, choices: [bird, cat, fish], clues: [{ emoji: '🪶', text: 'It has feathers.' }, { emoji: '☁️', text: 'It can fly.' }, { emoji: '🎵', text: 'It sings tweet tweet.' }] },
  { question: PET, answer: rabbit, choices: [rabbit, dog, turtle], clues: [{ emoji: '👂', text: 'It has long ears.' }, { emoji: '🦘', text: 'It hops.' }, { emoji: '🥕', text: 'It loves to nibble carrots.' }] },
  { question: PET, answer: turtle, choices: [turtle, cat, rabbit], clues: [{ emoji: '🐚', text: 'It has a shell.' }, { emoji: '🐌', text: 'It is very slow.' }, { emoji: '🙈', text: 'It can hide its head inside.' }] },
  { question: PLACE, answer: beach, choices: [beach, farm, snow], clues: [{ emoji: '🟨', text: 'There is sand.' }, { emoji: '🌊', text: 'There are waves.' }, { emoji: '🏰', text: 'You can build a sandcastle.' }] },
  { question: PLACE, answer: farm, choices: [farm, beach, space], clues: [{ emoji: '🐮', text: 'There are cows.' }, { emoji: '🏚️', text: 'There is a big red barn.' }, { emoji: '🚜', text: 'A tractor drives there.' }] },
  { question: PLACE, answer: space, choices: [space, farm, beach], clues: [{ emoji: '⭐', text: 'There are stars all around.' }, { emoji: '🪐', text: 'There are planets.' }, { emoji: '🛰️', text: 'You need a rocket to get there.' }] },
  { question: PLACE, answer: snow, choices: [snow, beach, farm], clues: [{ emoji: '🥶', text: 'It is very cold.' }, { emoji: '⛄', text: 'You can build a snowman.' }, { emoji: '🛷', text: 'You can ride a sled.' }] },
  { question: TOY, answer: ball, choices: [ball, kite, blocks], clues: [{ emoji: '⭕', text: 'It is round.' }, { emoji: '🦶', text: 'You can kick it.' }, { emoji: '⤴️', text: 'It bounces.' }] },
  { question: TOY, answer: kite, choices: [kite, ball, blocks], clues: [{ emoji: '☁️', text: 'It flies high in the sky.' }, { emoji: '🧵', text: 'It has a long string.' }, { emoji: '💨', text: 'It needs the wind.' }] },
  { question: TOY, answer: blocks, choices: [blocks, ball, kite], clues: [{ emoji: '🧩', text: 'You can stack them up.' }, { emoji: '🏗️', text: 'You can build a tower with them.' }, { emoji: '🟥', text: 'There are lots of little pieces.' }] },
]
