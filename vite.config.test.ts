import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'test-functional/test-pre-build.js'),
      formats: ['iife'],
      name: 'testBuild',
      fileName: () => 'test-build',
    },
    outDir: 'test-functional',
    emptyOutDir: false,
  },
})
