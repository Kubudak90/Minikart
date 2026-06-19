module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
  // Engine/format/persistence are pure TS; component tests use the RTL/jest-expo env.
  // AsyncStorage is mocked per-suite where needed (see ErrorBoundary.test.tsx).
};
