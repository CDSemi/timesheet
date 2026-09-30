import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // better-sqlite3 is a native addon; separate processes keep each test file isolated.
    pool: 'forks',
    testTimeout: 30_000,
  },
});
