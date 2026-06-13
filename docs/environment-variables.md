# Environment Variables

All **backend** environment variables live in `backend/.env`, loaded by `dotenv`
at startup. Copy [`backend/.env.example`](../backend/.env.example) →
`backend/.env` to begin — it documents every variable with safe placeholders. The
**frontend** has one optional build-time variable in `frontend/.env`, templated by
[`frontend/.env.example`](../frontend/.env.example).

> `.env` files are gitignored and must **never** be committed. Only the
> `.env.example` templates are tracked.

---

## Summary

| Variable | Where | Required? | Purpose |
|----------|-------|-----------|---------|
| `MONGO_URI` | backend | **Yes** | MongoDB connection string |
| `JWT_SECRET` | backend | **Yes** | Signs/verifies JWTs |
| `CORS_ORIGIN` | backend | Prod: **Yes** | Allowed frontend origin(s) |
| `REVIEWER_SIGNUP_SECRET` | backend | **Yes** | Gate for reviewer signups |
| `ADMIN_SIGNUP_SECRET` | backend | **Yes** | Gate for admin signups |
| `PORT` | backend | No (default 8000) | Server port |
| `EMAIL_SERVICE` | backend | Email only | nodemailer provider |
| `EMAIL_USER` | backend | Email only | Sending address |
| `EMAIL_PASSWORD` | backend | Email only | App password |
| `FRONTEND_URL` | backend | Email only | Base for reset links |
| `DISABLE_RATE_LIMIT` | backend | Tests only | Skips auth rate limiting |
| `BACKEND_URL` | frontend (dev) | No | Dev proxy target override |
| `VITE_API_BASE_URL` | frontend (build) | Prod: **Yes** | API base URL prefix |

Exhaustive list verified against `process.env.*` usages in `backend/src/`.

---

## Backend — required

### `MONGO_URI`
MongoDB connection string. Read in `src/config/db.js`.

```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ignition-portal?retryWrites=true&w=majority
```

**Critical:** the database name (`ignition-portal`) must sit **between the host
and the `?`**. Omit it and Mongoose silently uses a database named `test`. To get
the string: Atlas → Connect → Drivers (see [Getting Started](./getting-started.md#3-mongodb-get-a-connection-string)).
The variable is `MONGO_URI`, **not** `MONGODB_URI`.

### `JWT_SECRET`
Secret used to sign/verify JWTs (HS256). Changing it invalidates all existing
tokens (everyone must log in again).

```
JWT_SECRET=<long random string>
```

Generate a strong value:

```bash
openssl rand -hex 32
# or
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### `CORS_ORIGIN`
Comma-separated list of allowed browser origins. Read in `src/app.js`.

```
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

If empty/unset the server allows **all** origins (`origin: true`) — **dev only**.
**Production:** set the exact deployed frontend origin (a specific `https://…`);
never `*`, never empty.

### `REVIEWER_SIGNUP_SECRET` / `ADMIN_SIGNUP_SECRET`
Passphrases required in the `secret` field of `POST /signup/reviewer` and
`POST /signup/admin`. Without the matching secret these return `403`. Share them
out-of-band; rotate after launch.

```
REVIEWER_SIGNUP_SECRET=<random>
ADMIN_SIGNUP_SECRET=<different random>
```

---

## Backend — email (forgot/reset password)

Required only for the password-reset emails (that flow is being finished by
another team member). The same nodemailer setup will also power future applicant
emails (see `DEVELOPMENT-GUIDE.md` task B2).

### `EMAIL_SERVICE`
nodemailer service name. Default `gmail`.

### `EMAIL_USER`
The sending address, e.g. `noreply@ignitionhacks.com`.

### `EMAIL_PASSWORD`
The mailbox password — for Gmail an **App Password**, not your account password.
To create one: enable 2-Step Verification on the Google account, then Google
Account → Security → App passwords → generate one for "Mail". See
<https://support.google.com/accounts/answer/185833>.

### `FRONTEND_URL`
Public base URL of the frontend, used to build reset links:
`{FRONTEND_URL}/reset-password?token=…`.

```
FRONTEND_URL=http://localhost:5173    # prod: https://your-frontend-domain
```

---

## Backend — server & tests

### `PORT`
Express listen port. Default `8000`.

```
PORT=8000
```

The Vite dev proxy targets `http://localhost:8000` by default; if you change
`PORT`, point the proxy at it with `BACKEND_URL` (below) — it is **not** hardcoded.

### `DISABLE_RATE_LIMIT` (test/dev only)
When `=== 'true'`, the auth rate limiters are skipped (`src/middleware/rateLimit.js`).
The test suite sets this in `tests/setup.js` so the hundreds of auth calls aren't
throttled; `rate-limit.test.js` flips it off to exercise the 429 path. **Do not
set this in production.**

---

## Frontend

### `BACKEND_URL` (dev only)
Overrides the Vite dev-proxy target (default `http://localhost:8000`). Read in
`vite.config.js`. Use it when the backend runs on a non-default port:

```bash
BACKEND_URL=http://localhost:9000 npm run dev
```

### `VITE_API_BASE_URL` (build time)
Optional. When set, `apiUrl()` (`src/lib/api.js`) prefixes every API call with it.
Vite only exposes `VITE_`-prefixed vars to the client (`import.meta.env`).

```
VITE_API_BASE_URL=https://api.ignitionhacks.com
```

- **Dev:** leave blank — the Vite proxy handles routing (same origin).
- **Prod:** set to the backend's public origin (no trailing slash needed — it's
  stripped). The backend must allow this frontend's origin via `CORS_ORIGIN`.

---

## Production checklist

- [ ] `MONGO_URI` points at the production cluster (with the DB name).
- [ ] `JWT_SECRET` is a fresh 32+ byte random value (not the dev one).
- [ ] `CORS_ORIGIN` is the exact frontend origin (no `*`).
- [ ] `REVIEWER_SIGNUP_SECRET` / `ADMIN_SIGNUP_SECRET` rotated to strong values.
- [ ] Email vars set if password reset / applicant emails are enabled.
- [ ] `FRONTEND_URL` is the real frontend URL.
- [ ] Frontend built with `VITE_API_BASE_URL` = backend public URL.
- [ ] `DISABLE_RATE_LIMIT` is **unset**.
- [ ] No `.env` committed; secrets stored in the host's secret manager.
