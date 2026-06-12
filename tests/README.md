# Ignition Portal — Test Suite

End-to-end / integration tests for the backend API. Every test drives the real
Express app through HTTP (via [supertest](https://github.com/ladjs/supertest))
against a throwaway in-memory MongoDB
([mongodb-memory-server](https://github.com/typegoose/mongodb-memory-server)),
so the full request → route → Mongoose → database path is exercised — no mocks.

## Running

```bash
cd tests
npm install      # first time only (downloads a mongod binary on first run)
npm test         # run everything once
npm run test:watch
```

No `.env`, no running server, and no external database are required — the suite
spins up its own MongoDB and sets its own secrets.

## How it works

- **`globalSetup.js`** — runs once in the main process. Starts a single
  in-memory MongoDB for the whole run and exposes its URI via
  `process.env.MONGO_TEST_URI`, then stops it at the end. Keeping the mongod
  child process in the main process (not a worker) makes the run fast and
  avoids worker-teardown races.
- **`setup.js`** — vitest `setupFiles` (per file). Connects the **backend's**
  shared mongoose instance (imported from `backend/src/config/db.js`) to that
  database, so the models the app registers use the exact same connection the
  tests talk to. Collections are wiped after every test for isolation.
- **`helpers/app.js`** — builds the Express app via `createApp()` (from
  `backend/src/app.js`, which has no DB/listen side effects) and exposes an
  `api()` supertest factory.
- **`helpers/factories.js`** — registers applicants / reviewers / admins through
  the real signup routes and returns their JWTs, plus builders for valid
  application payloads and a fully-submitted application.

## Coverage

**127 tests across 9 files**, all passing.

| Suite | What it covers |
|-------|----------------|
| `integration/auth.test.js` | signup (applicant/reviewer/admin), secrets, login, JWT middleware |
| `integration/password-reset.test.js` | full reset flow (DB-seeded token), single-use, expiry, weak-password, email case-insensitivity |
| `integration/applications.test.js` | draft create/update, versioning, cross-device persistence, field coercion, response limits, slice-independence, revert guard |
| `integration/submit.test.js` | per-field completeness, conditional `program` rule by level, ownership, double-submit, 404 |
| `integration/teammates.test.js` | lookup by id, max-3, self/duplicate/non-applicant/missing rejection, server-derived name/email, name splitting |
| `integration/reviews.test.js` | scoring, role gating, duplicate reviews, **comment persistence round-trip**, update/recompute, multi-reviewer, reviewer pool status |
| `integration/admin.test.js` | role protection, stats + coverage buckets, pagination/search/filter, CSV quoting, user management edges, status changes |
| `integration/security.test.js` | JWT edge cases (wrong secret, expired, tampered, deleted user), full RBAC matrix |
| `unit/models.test.js` | schema validators (`validateSync`) and the password-hash / `updatedAt` save hooks — no HTTP |

## Notes

- A single shared in-memory MongoDB is used for the whole run; test **files run
  sequentially** (`fileParallelism: false`) and wipe collections between tests.
- `unit/` tests hit the Mongoose models directly (validators/hooks); `integration/`
  tests go through the real HTTP API with supertest.
- These are backend tests. The frontend is validated separately via
  `npm run build` and `npm run lint` in `frontend/`.
