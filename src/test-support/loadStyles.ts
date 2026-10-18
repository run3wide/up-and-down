/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Puts the app's real stylesheets on the page for the length of one test. Vitest blanks CSS imports, so they are read
 * from disk; paths are relative to `src/`. jsdom has no layout, but it does apply the cascade, which is enough to check
 * things like "this screen can scroll".
 */
export function loadStyles(...paths: string[]): () => void {
  const style = document.createElement('style')
  style.textContent = paths.map((path) => readFileSync(join(process.cwd(), 'src', path), 'utf8')).join('\n')
  document.head.append(style)
  return () => style.remove()
}
