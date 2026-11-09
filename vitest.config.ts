import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['lib/**/*.test.ts'],
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/**/*.test.ts'],
      thresholds: { 100: true },
    },
  },
})
