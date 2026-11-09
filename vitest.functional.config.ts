import { defineConfig } from 'vitest/config'

// Tests the built package in dist/, so coverage of lib/ does not apply
export default defineConfig({
  test: {
    include: ['test/functional/**/*.test.js'],
    coverage: { enabled: false },
  },
})
