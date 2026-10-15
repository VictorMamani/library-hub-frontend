module.exports = {
  testEnvironment: '<rootDir>/tests/browser-environment.cjs',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  transform: {
    '^.+\\.[tj]sx?$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript',
        ],
      },
    ],
  },
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/tests/style-mock.cjs',
    '\\.(svg|png|jpg)$': '<rootDir>/tests/file-mock.cjs',
  },
  clearMocks: true,
  coverageReporters: ['text', 'json-summary', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/main.tsx',
    '!src/types.ts',
  ],
};
