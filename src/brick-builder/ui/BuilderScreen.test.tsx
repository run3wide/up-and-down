import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BuilderScreen } from './BuilderScreen'

const tray = () => within(screen.getByRole('group', { name: 'Bricks' }))
const plate = () => within(screen.getByRole('group', { name: 'Baseplate' }))
const placed = () => plate().queryAllByRole('button', { name: /^Take off/ })

function tapBrickThenColumn(brick: RegExp | string, column: number) {
  fireEvent.click(tray().getByRole('button', { name: brick }))
  fireEvent.click(screen.getByRole('button', { name: `Put it in column ${column}` }))
}

describe('BuilderScreen', () => {
  it('starts with an empty plate and a tray of bricks to choose from', () => {
    render(<BuilderScreen onExit={() => {}} />)

    expect(placed()).toHaveLength(0)
    expect(tray().getAllByRole('button').length).toBeGreaterThan(4)
  })

  it('puts a chosen brick in the column that is tapped', () => {
    render(<BuilderScreen onExit={() => {}} />)

    tapBrickThenColumn('Red brick, 2 wide', 3)

    expect(placed()).toHaveLength(1)
    expect(placed()[0]).toHaveAccessibleName('Take off red brick, 2 wide')
  })

  it('stacks a second brick on the first', () => {
    render(<BuilderScreen onExit={() => {}} />)

    tapBrickThenColumn('Red brick, 2 wide', 3)
    tapBrickThenColumn('Blue brick, 4 wide', 3)

    expect(placed()).toHaveLength(2)
    expect(placed()[1]).toHaveStyle({ bottom: '10%' })
  })

  it('offers columns only while a brick is chosen, and lets the choice be undone', () => {
    render(<BuilderScreen onExit={() => {}} />)
    expect(screen.queryByRole('button', { name: /^Put it in column/ })).not.toBeInTheDocument()

    fireEvent.click(tray().getByRole('button', { name: 'Red brick, 2 wide' }))
    expect(screen.getAllByRole('button', { name: /^Put it in column/ })).toHaveLength(12)

    fireEvent.click(tray().getByRole('button', { name: 'Red brick, 2 wide' }))
    expect(screen.queryByRole('button', { name: /^Put it in column/ })).not.toBeInTheDocument()
  })

  it('takes a brick off when it is tapped', () => {
    render(<BuilderScreen onExit={() => {}} />)
    tapBrickThenColumn('Red brick, 2 wide', 3)

    fireEvent.click(placed()[0])

    expect(placed()).toHaveLength(0)
  })

  it('starts again with a clear plate', () => {
    render(<BuilderScreen onExit={() => {}} />)
    tapBrickThenColumn('Red brick, 2 wide', 3)
    tapBrickThenColumn('Blue brick, 4 wide', 6)

    fireEvent.click(screen.getByRole('button', { name: 'Start again' }))

    expect(placed()).toHaveLength(0)
  })

  it('builds from a brick dragged onto the plate', () => {
    render(<BuilderScreen onExit={() => {}} />)
    vi.spyOn(screen.getByRole('group', { name: 'Baseplate' }), 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 1200, height: 1000, right: 1200, bottom: 1000, x: 0, y: 0, toJSON: () => ({}) })

    fireEvent.pointerDown(tray().getByRole('button', { name: 'Red brick, 2 wide' }), { clientX: 50, clientY: 1200 })
    fireEvent.pointerMove(window, { clientX: 500, clientY: 500 })
    fireEvent.pointerUp(window, { clientX: 500, clientY: 500 })

    expect(placed()).toHaveLength(1)
    expect(placed()[0]).toHaveStyle({ left: `${(4 / 12) * 100}%` })
  })

  it('drops nothing when a drag is let go away from the plate', () => {
    render(<BuilderScreen onExit={() => {}} />)
    vi.spyOn(screen.getByRole('group', { name: 'Baseplate' }), 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 1200, height: 1000, right: 1200, bottom: 1000, x: 0, y: 0, toJSON: () => ({}) })

    fireEvent.pointerDown(tray().getByRole('button', { name: 'Red brick, 2 wide' }), { clientX: 50, clientY: 1200 })
    fireEvent.pointerMove(window, { clientX: 500, clientY: 1300 })
    fireEvent.pointerUp(window, { clientX: 500, clientY: 1300 })

    expect(placed()).toHaveLength(0)
  })

  it('goes back to the games', () => {
    const onExit = vi.fn()
    render(<BuilderScreen onExit={onExit} />)

    fireEvent.click(screen.getByRole('button', { name: 'Back to games' }))

    expect(onExit).toHaveBeenCalled()
  })
})
