import { defineConfig } from 'vitest/config'

// Tests the built package in dist/. Coverage stays off, the Vitest default.
export default defineConfig({
  test: {
    include: ['test/functional/**/*.test.ts'],
  },
})
