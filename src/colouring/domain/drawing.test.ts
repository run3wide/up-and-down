import { describe, expect, it } from 'vitest'
import { BRUSHES, Drawing } from './drawing'

const [thin, , thick] = BRUSHES

describe('Drawing', () => {
  it('starts as a blank page', () => {
    expect(new Drawing().snapshot().strokes).toEqual([])
  })

  it('keeps each stroke in the colour and brush it was drawn with', () => {
    const drawing = new Drawing()

    drawing.addStroke('red', thin.id, [[10, 10], [20, 20]])
    drawing.addStroke('blue', thick.id, [[50, 50]])

    expect(drawing.snapshot().strokes).toEqual([
      { colour: 'red', brush: thin.id, points: [[10, 10], [20, 20]] },
      { colour: 'blue', brush: thick.id, points: [[50, 50]] },
    ])
  })

  it('ignores a stroke with an unknown colour or brush, or with no points', () => {
    const drawing = new Drawing()

    drawing.addStroke('not-a-colour', thin.id, [[1, 1]])
    drawing.addStroke('red', 'not-a-brush', [[1, 1]])
    drawing.addStroke('red', thin.id, [])

    expect(drawing.snapshot().strokes).toEqual([])
  })

  it('keeps points on the page, rounded, without repeats', () => {
    const drawing = new Drawing()

    drawing.addStroke('red', thin.id, [[-5, 120], [10.04, 10.06], [10.02, 10.08], [30, Number.NaN]])

    expect(drawing.snapshot().strokes[0].points).toEqual([[0, 100], [10, 10.1]])
  })

  it('undoes one stroke at a time', () => {
    const drawing = new Drawing()
    drawing.addStroke('red', thin.id, [[1, 1]])
    drawing.addStroke('blue', thin.id, [[2, 2]])

    drawing.undo()
    expect(drawing.snapshot().strokes.map(({ colour }) => colour)).toEqual(['red'])
    drawing.undo()
    drawing.undo()
    expect(drawing.snapshot().strokes).toEqual([])
  })

  it('wipes the page clean, and that can be undone', () => {
    const drawing = new Drawing()
    drawing.addStroke('red', thin.id, [[1, 1]])
    drawing.addStroke('blue', thin.id, [[2, 2]])

    drawing.clear()
    expect(drawing.snapshot().strokes).toEqual([])

    drawing.undo()
    expect(drawing.snapshot().strokes).toHaveLength(2)
  })

  it('picks up a saved drawing, dropping any stroke that no longer fits', () => {
    const drawing = new Drawing([
      { colour: 'red', brush: thin.id, points: [[1, 1]] },
      { colour: 'nope', brush: thin.id, points: [[1, 1]] },
    ])

    expect(drawing.snapshot().strokes).toHaveLength(1)
  })
})
