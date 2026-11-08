import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['lib/**/*.test.ts'],
    exclude: ['test-functional/**'],
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/**/*.test.ts'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
