/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

export interface SourceFile {
  readonly path: string
  readonly text: string
}

/** Every file under the repo's `src/` (and `index.html`) that ships to the browser: no tests, no test helpers. */
export function shippedFiles(extensions: readonly string[]): SourceFile[] {
  const root = process.cwd()
  const files = [...walk(join(root, 'src')), join(root, 'index.html')]
  return files
    .filter((file) => extensions.some((extension) => file.endsWith(extension)))
    .filter((file) => !/\.test\.tsx?$/.test(file) && !file.includes('/test-support/') && !file.endsWith('test-setup.ts'))
    .map((file) => ({ path: relative(root, file), text: readFileSync(file, 'utf8') }))
}

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)],
  )
}
