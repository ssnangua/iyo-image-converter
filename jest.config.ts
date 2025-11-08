import type { Config } from 'jest'

export default <Config>{
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['packages/**/src/*.ts'],
  coverageDirectory: 'coverage',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePathIgnorePatterns: ['.*/node-modules/', '<rootDir>/dist/']
}
