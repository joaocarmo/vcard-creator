module.exports = {
  preset: 'ts-jest',
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
