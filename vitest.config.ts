import { defineConfig } from 'vitest/config';

/**
 * Configure Vitest to discover our TypeScript test suite within the dedicated
 * `test` directory so that we avoid polluting the generated SDK output that
 * lives under `src`.
 */
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    reporters: 'default',
  },
});
