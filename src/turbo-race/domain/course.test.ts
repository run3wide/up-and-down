import { describe, expect, it } from 'vitest'
import { COURSE_START_CLEAR, FINISH_DISTANCE, ITEM_MAX_X, ITEM_MIN_X, buildCourse } from './course'

function seeded(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

describe('buildCourse', () => {
  it('is the same course every time for the same random source', () => {
    expect(buildCourse(seeded(7))).toEqual(buildCourse(seeded(7)))
  })

  it('is a different course for a different random source', () => {
    expect(buildCourse(seeded(7))).not.toEqual(buildCourse(seeded(8)))
  })

  it('keeps everything on the road', () => {
    for (const item of buildCourse(seeded(3))) {
      expect(item.x).toBeGreaterThanOrEqual(ITEM_MIN_X)
      expect(item.x).toBeLessThanOrEqual(ITEM_MAX_X)
    }
  })

  it('leaves a clear run at the start and nothing past the finish line', () => {
    const course = buildCourse(seeded(3))

    expect(Math.min(...course.map((item) => item.at))).toBeGreaterThanOrEqual(COURSE_START_CLEAR)
    expect(Math.max(...course.map((item) => item.at))).toBeLessThan(FINISH_DISTANCE)
  })

  it('is ordered along the road and every item has its own id', () => {
    const course = buildCourse(seeded(5))

    expect(course.map((item) => item.at)).toEqual([...course.map((item) => item.at)].sort((a, b) => a - b))
    expect(new Set(course.map((item) => item.id)).size).toBe(course.length)
  })

  it('has both hazards to dodge and cookies to collect', () => {
    const kinds = new Set(buildCourse(seeded(5)).map((item) => item.kind))

    expect(kinds).toContain('cookie')
    expect(kinds.has('cone') || kinds.has('rock')).toBe(true)
  })

  it('never blocks the whole road: obstacles at the same spot leave a gap to drive through', () => {
    const course = buildCourse(seeded(11)).filter((item) => item.kind !== 'cookie')
    const rows = new Map<number, typeof course>()
    for (const item of course) {
      const key = Math.round(item.at / 4)
      rows.set(key, [...(rows.get(key) ?? []), item])
    }

    for (const row of rows.values()) {
      const xs = row.map((item) => item.x).sort((a, b) => a - b)
      const edges = [ITEM_MIN_X, ...xs, ITEM_MAX_X]
      const widestGap = Math.max(...edges.slice(1).map((edge, i) => edge - edges[i]))
      expect(widestGap).toBeGreaterThan(20)
    }
  })
})
