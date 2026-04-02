module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/test-functional/'],
  setupFiles: ['jest-date-mock'],
  testRegex: '\\.test\\.[jt]s$',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          ignoreDeprecations: '6.0',
        },
      },
    ],
  },
}
