import { describe, expect, it } from 'vitest'
import { shippedFiles } from './test-support/sourceFiles'

/**
 * The house rules for a kids' game on a public site, kept as tests so a rule slips only on purpose.
 * See "Safe for kids" and "Public repo" in CLAUDE.md.
 */
const CODE = ['.ts', '.tsx', '.css', '.html']

describe('child safety and privacy', () => {
  it('has something to check', () => {
    expect(shippedFiles(CODE).length).toBeGreaterThan(50)
  })

  it('never reaches another site: no links out, CDNs or third-party scripts', () => {
    const remote = shippedFiles(CODE).flatMap(({ path, text }) =>
      (text.match(/https?:\/\/[^\s'"`)]+/g) ?? []).filter((url) => !url.startsWith('http://www.w3.org/')).map((url) => `${path}: ${url}`),
    )

    expect(remote).toEqual([])
  })

  it('makes no network calls beyond reading its own bundled clips', () => {
    const calls = shippedFiles(['.ts', '.tsx']).flatMap(({ path, text }) =>
      (text.match(/XMLHttpRequest|sendBeacon|WebSocket|EventSource|navigator\.geolocation|\bfetch\((?!CLIPS)/g) ?? []).map((call) => `${path}: ${call}`),
    )

    expect(calls).toEqual([])
  })

  it('stores nothing but best scores and the Dino Dig museum, on the device', () => {
    const storage = shippedFiles(['.ts', '.tsx'])
      .filter(({ path }) => !path.endsWith('LocalStorageBestScoreStore.ts') && !path.endsWith('LocalStorageCollectionStore.ts'))
      .flatMap(({ path, text }) => (text.match(/localStorage|sessionStorage|indexedDB|document\.cookie/g) ?? []).map((use) => `${path}: ${use}`))

    expect(storage).toEqual([])
  })

  it('keeps emails and local paths out of the public site', () => {
    const leaks = shippedFiles(CODE).flatMap(({ path, text }) =>
      (text.match(/\/Users\/\S+|[\w.+-]+@[\w-]+\.[\w.-]+/g) ?? []).map((leak) => `${path}: ${leak}`),
    )

    expect(leaks).toEqual([])
  })

  it('calms every animation when the player prefers reduced motion', () => {
    const stylesheets = shippedFiles(['.css'])
    const animates = stylesheets.some(({ text }) => /animation:/.test(text))
    const calmedForEveryone = stylesheets.some(({ text }) =>
      /@media \(prefers-reduced-motion: reduce\)\s*{\s*\*,[^}]*animation: none !important/.test(text),
    )

    expect(animates).toBe(true)
    expect(calmedForEveryone).toBe(true)
  })

  it('never flashes: no animation steps through colours or opacity faster than three times a second', () => {
    const quick = shippedFiles(['.css']).flatMap(({ path, text }) =>
      [...text.matchAll(/animation(?:-duration)?:[^;]*?(\d*\.?\d+)(ms|s)\b[^;]*infinite/g)]
        .filter(([, amount, unit]) => (unit === 'ms' ? Number(amount) : Number(amount) * 1000) < 333)
        .map(([declaration]) => `${path}: ${declaration}`),
    )

    expect(quick).toEqual([])
  })
})
