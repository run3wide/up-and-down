import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// The repo name is the Pages sub-path, so production assets and game addresses live under it.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/up-and-down/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
}))
