// @ts-check
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'babel.config.js',
      'dist/',
      'jest.config.js',
      'node_modules',
      'test-functional/',
      'webpack.config.js',
    ],
  },
)
