import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    // Undo vi.spyOn() after each test
    restoreMocks: true,
    include: ['lib/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/**/*.test.ts'],
      thresholds: { 100: true },
    },
  },
})
