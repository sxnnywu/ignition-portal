// tests/globalSetup.js
//
// Runs once in the MAIN vitest process (not a worker). Starts a single
// in-memory MongoDB for the whole run and exposes its URI to the workers via
// an env var, then stops it at the very end. Keeping the mongod child process's
// lifecycle in the main process avoids worker-teardown IPC races
// ("Channel closed" unhandled rejections) and is much faster than starting a
// fresh mongod per test file.

import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

export async function setup() {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_TEST_URI = mongod.getUri();
}

export async function teardown() {
  if (mongod) await mongod.stop();
}
