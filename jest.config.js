module.exports = {
  preset: 'ts-jest',
  modulePathIgnorePatterns: ['<rootDir>/test-functional/'],
  setupFiles: ['jest-date-mock'],
  testRegex: '(/__tests__/.*)\\.test\\.[jt]s$',
}
