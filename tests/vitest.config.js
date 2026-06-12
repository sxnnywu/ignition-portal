import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['integration/**/*.test.js', 'unit/**/*.test.js'],
    // one in-memory MongoDB for the whole run (started in the main process)
    globalSetup: ['./globalSetup.js'],
    // per-file: connect mongoose, wipe collections between tests
    setupFiles: ['./setup.js'],
    testTimeout: 30000,
    // first run may download the mongod binary
    hookTimeout: 120000,
    // files share the backend mongoose singleton (per worker) against one DB;
    // run them sequentially and wipe collections between tests for isolation
    fileParallelism: false,
  },
});
