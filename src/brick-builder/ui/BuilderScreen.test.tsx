import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BuilderScreen } from './BuilderScreen'

function renderBuilder(onExit = () => {}) {
  const sound = { unlock: vi.fn(), play: vi.fn() }
  render(<BuilderScreen sound={sound} onExit={onExit} />)
  return { sound }
}

const tray = () => within(screen.getByRole('group', { name: 'Bricks' }))
const plate = () => within(screen.getByRole('group', { name: 'Baseplate' }))
const placed = () => plate().queryAllByRole('button', { name: /^Take off/ })

function tapBrickThenColumn(brick: RegExp | string, column: number) {
  fireEvent.click(tray().getByRole('button', { name: brick }))
  fireEvent.click(screen.getByRole('button', { name: `Put it in column ${column}` }))
}

describe('BuilderScreen', () => {
  it('starts with an empty plate and a tray of bricks to choose from', () => {
    renderBuilder()

    expect(placed()).toHaveLength(0)
    expect(tray().getAllByRole('button').length).toBeGreaterThan(4)
  })

  it('puts a chosen brick in the column that is tapped', () => {
    renderBuilder()

    tapBrickThenColumn('Red brick, 2 wide', 3)

    expect(placed()).toHaveLength(1)
    expect(placed()[0]).toHaveAccessibleName('Take off red brick, 2 wide')
  })

  it('stacks a second brick on the first', () => {
    renderBuilder()

    tapBrickThenColumn('Red brick, 2 wide', 3)
    tapBrickThenColumn('Blue brick, 4 wide', 3)

    expect(placed()).toHaveLength(2)
    expect(placed()[1]).toHaveStyle({ bottom: '10%' })
  })

  it('offers columns only while a brick is chosen, and lets the choice be undone', () => {
    renderBuilder()
    expect(screen.queryByRole('button', { name: /^Put it in column/ })).not.toBeInTheDocument()

    fireEvent.click(tray().getByRole('button', { name: 'Red brick, 2 wide' }))
    expect(screen.getAllByRole('button', { name: /^Put it in column/ })).toHaveLength(12)

    fireEvent.click(tray().getByRole('button', { name: 'Red brick, 2 wide' }))
    expect(screen.queryByRole('button', { name: /^Put it in column/ })).not.toBeInTheDocument()
  })

  it('takes a brick off when it is tapped', () => {
    renderBuilder()
    tapBrickThenColumn('Red brick, 2 wide', 3)

    fireEvent.click(placed()[0])

    expect(placed()).toHaveLength(0)
  })

  it('starts again with a clear plate', () => {
    renderBuilder()
    tapBrickThenColumn('Red brick, 2 wide', 3)
    tapBrickThenColumn('Blue brick, 4 wide', 6)

    fireEvent.click(screen.getByRole('button', { name: 'Start again' }))

    expect(placed()).toHaveLength(0)
  })

  it('builds from a brick dragged onto the plate', () => {
    renderBuilder()
    vi.spyOn(screen.getByRole('group', { name: 'Baseplate' }), 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 1200, height: 1000, right: 1200, bottom: 1000, x: 0, y: 0, toJSON: () => ({}) })

    fireEvent.pointerDown(tray().getByRole('button', { name: 'Red brick, 2 wide' }), { clientX: 50, clientY: 1200 })
    fireEvent.pointerMove(window, { clientX: 500, clientY: 500 })
    fireEvent.pointerUp(window, { clientX: 500, clientY: 500 })

    expect(placed()).toHaveLength(1)
    expect(placed()[0]).toHaveStyle({ left: `${(4 / 12) * 100}%` })
  })

  it('drops nothing when a drag is let go away from the plate', () => {
    renderBuilder()
    vi.spyOn(screen.getByRole('group', { name: 'Baseplate' }), 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 1200, height: 1000, right: 1200, bottom: 1000, x: 0, y: 0, toJSON: () => ({}) })

    fireEvent.pointerDown(tray().getByRole('button', { name: 'Red brick, 2 wide' }), { clientX: 50, clientY: 1200 })
    fireEvent.pointerMove(window, { clientX: 500, clientY: 1300 })
    fireEvent.pointerUp(window, { clientX: 500, clientY: 1300 })

    expect(placed()).toHaveLength(0)
  })

  it('goes back to the games', () => {
    const onExit = vi.fn()
    renderBuilder(onExit)

    fireEvent.click(screen.getByRole('button', { name: 'Back to games' }))

    expect(onExit).toHaveBeenCalled()
  })

  it('clicks when a brick lands, and pops when one comes off', () => {
    const { sound } = renderBuilder()

    tapBrickThenColumn('Red brick, 2 wide', 3)
    expect(sound.play).toHaveBeenLastCalledWith('brickSnap')
    fireEvent.click(placed()[0])

    expect(sound.play).toHaveBeenLastCalledWith('brickPop')
  })

  it('stays quiet when muted, and sounds again when unmuted', () => {
    const { sound } = renderBuilder()

    fireEvent.click(screen.getByRole('button', { name: 'Mute sound' }))
    tapBrickThenColumn('Red brick, 2 wide', 3)
    expect(sound.play).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Unmute sound' }))
    tapBrickThenColumn('Blue brick, 4 wide', 6)
    expect(sound.play).toHaveBeenCalledWith('brickSnap')
  })
})

describe('building a picture', () => {
  const pictures = () => within(screen.getByRole('group', { name: 'Pictures' }))
  const guides = () => screen.queryAllByTestId('guide')

  /** Drops a brick by dragging it so its left edge lands on `column`, whatever the brick's width. */
  function dragOnto(brick: string, width: number, column: number) {
    const rect = { left: 0, top: 0, width: 1200, height: 1000, right: 1200, bottom: 1000, x: 0, y: 0, toJSON: () => ({}) }
    vi.spyOn(screen.getByRole('group', { name: 'Baseplate' }), 'getBoundingClientRect').mockReturnValue(rect)
    const x = (column + width / 2) * 100
    fireEvent.pointerDown(tray().getByRole('button', { name: brick }), { clientX: 50, clientY: 1200 })
    fireEvent.pointerMove(window, { clientX: x, clientY: 500 })
    fireEvent.pointerUp(window, { clientX: x, clientY: 500 })
  }

  function buildTheHouse() {
    dragOnto('Orange brick, 2 wide', 2, 3)
    dragOnto('Orange brick, 2 wide', 2, 6)
    dragOnto('Teal brick, 4 wide', 4, 3)
    dragOnto('Pink brick, 1 wide', 1, 7)
    dragOnto('Green brick, 3 wide', 3, 4)
    dragOnto('Yellow brick, 1 wide', 1, 5)
  }

  it('offers free building and the pictures, with free building to begin with', () => {
    renderBuilder()

    expect(pictures().getAllByRole('button').map((button) => button.textContent)).toEqual(['Free build', 'House', 'Rocket', 'Truck'])
    expect(pictures().getByRole('button', { name: 'Free build' })).toHaveAttribute('aria-pressed', 'true')
    expect(guides()).toHaveLength(0)
  })

  it('shows where every brick of the picture goes, and how many are left to place', () => {
    renderBuilder()

    fireEvent.click(pictures().getByRole('button', { name: 'House' }))

    expect(guides()).toHaveLength(6)
    expect(screen.getByRole('status')).toHaveTextContent('House')
    expect(screen.getByRole('status')).toHaveTextContent('0 of 6')
  })

  it('counts each brick put in the right place and stops guiding it', () => {
    renderBuilder()
    fireEvent.click(pictures().getByRole('button', { name: 'House' }))

    dragOnto('Orange brick, 2 wide', 2, 3)

    expect(screen.getByRole('status')).toHaveTextContent('1 of 6')
    expect(guides()).toHaveLength(5)
  })

  it('does not count a brick in the wrong place', () => {
    renderBuilder()
    fireEvent.click(pictures().getByRole('button', { name: 'House' }))

    dragOnto('Orange brick, 2 wide', 2, 0)

    expect(screen.getByRole('status')).toHaveTextContent('0 of 6')
  })

  it('cheers when the picture is finished, and offers the next one', () => {
    const { sound } = renderBuilder()
    fireEvent.click(pictures().getByRole('button', { name: 'House' }))

    buildTheHouse()

    expect(screen.getByRole('status')).toHaveTextContent('You built the House!')
    expect(sound.play).toHaveBeenCalledWith('builtIt')
    expect(sound.play.mock.calls.filter(([effect]) => effect === 'builtIt')).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: 'Next picture' }))

    expect(pictures().getByRole('button', { name: 'Rocket' })).toHaveAttribute('aria-pressed', 'true')
    expect(placed()).toHaveLength(0)
    expect(guides()).toHaveLength(6)
  })

  it('starts a picture on a clear plate, and free build leaves the guides behind', () => {
    renderBuilder()
    tapBrickThenColumn('Red brick, 2 wide', 3)

    fireEvent.click(pictures().getByRole('button', { name: 'Truck' }))
    expect(placed()).toHaveLength(0)
    expect(guides()).toHaveLength(7)

    fireEvent.click(pictures().getByRole('button', { name: 'Free build' }))
    expect(guides()).toHaveLength(0)
  })

  it('keeps the guides when starting again', () => {
    renderBuilder()
    fireEvent.click(pictures().getByRole('button', { name: 'House' }))
    dragOnto('Orange brick, 2 wide', 2, 3)

    fireEvent.click(screen.getByRole('button', { name: 'Start again' }))

    expect(guides()).toHaveLength(6)
    expect(screen.getByRole('status')).toHaveTextContent('0 of 6')
  })
})
