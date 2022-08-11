module.exports = {
  preset: 'ts-jest',
  modulePathIgnorePatterns: ['<rootDir>/test-functional/'],
  setupFiles: ['jest-date-mock'],
  testRegex: '\\.test\\.[jt]s$',
}
