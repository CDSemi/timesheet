import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // better-sqlite3 is a native addon; separate processes keep each test file isolated.
    pool: 'forks',
    // Many integration files spawn CLI children; one fork per logical CPU oversubscribes a loaded or small host
    // and pushes spawn-heavy tests past the timeout. Half the logical CPUs keeps the same coverage.
    maxWorkers: '50%',
    testTimeout: 30_000,
  },
});
