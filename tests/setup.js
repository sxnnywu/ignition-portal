// tests/setup.js
//
// Per-file setup (vitest setupFiles). Connects the BACKEND's shared mongoose
// singleton to the single in-memory MongoDB started by globalSetup.js (URI in
// process.env.MONGO_TEST_URI). Because we import mongoose from the backend's db
// config, the models the app registers use the exact same connection — so HTTP
// requests made through supertest hit this database.
//
// Required environment variables for the auth routes are set here before the
// app (and its route modules) are imported anywhere.

import { beforeAll, afterAll, afterEach } from 'vitest';
import { mongoose } from '../backend/src/config/db.js';

// deterministic secrets for the test run (never the real ones)
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REVIEWER_SIGNUP_SECRET = 'test-reviewer-secret';
process.env.ADMIN_SIGNUP_SECRET = 'test-admin-secret';
process.env.CORS_ORIGIN = '';
// disable rate limiting for the bulk of the suite (hundreds of auth calls);
// the rate-limit test flips this to 'false' to exercise the 429 path
process.env.DISABLE_RATE_LIMIT = 'true';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI);
});

afterEach(async () => {
  // wipe every collection between tests for full isolation
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((collection) => collection.deleteMany({})),
  );
});

afterAll(async () => {
  await mongoose.disconnect();
});
