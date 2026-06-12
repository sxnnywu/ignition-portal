# Testing

The repository ships a dedicated **end-to-end / integration test suite** for the
backend API, living in the top-level `tests/` folder. Every test drives the real
Express app over HTTP against a throwaway in-memory MongoDB — no mocks, no
running server, and no external database required.

## Running the tests

```bash
cd tests
npm install      # first run only — downloads a mongod binary for mongodb-memory-server
npm test         # run the whole suite once
npm run test:watch
```

The suite sets its own secrets and spins up its own database, so it does **not**
read `backend/.env` or touch your real MongoDB.

## How it works

| Piece | Responsibility |
|-------|----------------|
| `tests/globalSetup.js` | Runs once in the main process: starts a single in-memory MongoDB for the whole run and shares its URI via an env var, then stops it at the end. |
| `tests/setup.js` | Vitest `setupFiles` (per file). Connects the **backend's** shared mongoose instance (from `backend/src/config/db.js`) to that database so the app and the tests use the same connection. Wipes all collections after each test. |
| `tests/helpers/app.js` | Builds the app via `createApp()` (from `backend/src/app.js`, which has no DB/listen side effects) and exposes a supertest `api()` factory. |
| `tests/helpers/factories.js` | Registers applicants/reviewers/admins through the real signup routes and returns their JWTs; builds valid application payloads and fully-submitted applications. |
| `tests/integration/*.test.js` | The suites (see below). |

This is why the backend was split into `app.js` (pure app construction) and
`index.js` (DB connect + `listen`): the test suite can import the app without
starting a server or connecting to the production database.

## What's covered

| Suite | Focus |
|-------|-------|
| `integration/auth.test.js` | signup (applicant/reviewer/admin + secrets), login, JWT middleware |
| `integration/password-reset.test.js` | full reset flow via a DB-seeded token (no email): success, single-use, expiry, weak password, email case-insensitivity |
| `integration/applications.test.js` | draft create/update, version bumping, cross-device persistence, field coercion, response limits, slice-independence, revert guard |
| `integration/submit.test.js` | per-field completeness, conditional `program` rule by education level, `0 hackathons` accepted, ownership, double-submit |
| `integration/teammates.test.js` | lookup by id, max-3, self/duplicate/non-applicant/missing rejection, server-derived name/email, name splitting |
| `integration/reviews.test.js` | scoring, role gating, duplicate-review 409, **reviewer comment persistence round-trip**, update/recompute, multi-reviewer, reviewer-pool status |
| `integration/admin.test.js` | role protection, stats + coverage buckets, pagination/search/filter, CSV quoting, user-management edges, status transitions |
| `integration/security.test.js` | JWT edge cases (wrong secret, expired, tampered, deleted-user) and the full role-based access-control matrix |
| `unit/models.test.js` | schema validators and save hooks exercised directly on the Mongoose models (no HTTP) |

At the time of writing the suite is **127 tests across 9 files, all passing**.

## Frontend checks

The frontend currently has no component test suite; it is validated with:

```bash
cd frontend
npm run lint     # ESLint 9 (react-hooks, react-refresh)
npm run build    # production build must succeed
```

Both are part of the definition of done for frontend changes.

## Conventions for new tests

- Put HTTP/API suites in `tests/integration/` and schema/validator unit tests in
  `tests/unit/`, named `*.test.js`.
- For integration tests use the factories rather than writing models directly —
  it keeps them true end-to-end and resilient to schema changes.
- Test files run **sequentially** against one shared in-memory database; rely on
  the per-test collection wipe for isolation rather than hard-coded ids.
