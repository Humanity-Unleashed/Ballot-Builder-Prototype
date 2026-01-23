/** @type {import('jest').Config} */
module.exports = {
  // Use ts-jest for TypeScript files
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Only look for tests in __tests__ directories or files with .test.ts extension
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/*.test.ts'
  ],

  // Exclude data directory and node_modules from test matching
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/data/'
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Coverage settings (optional, for future use)
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/data/**',
    '!src/types/**'
  ],

  // Clear mocks between tests
  clearMocks: true,
};
