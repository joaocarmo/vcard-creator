/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'vcardcreator',
      formats: ['umd'],
      fileName: () => 'vcard-creator.js',
    },
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
  },
  test: {
    globals: true,
    include: ['lib/**/*.test.ts'],
    exclude: ['test-functional/**'],
  },
})
