# Security

A single reference for every security mechanism in the portal, and the known
gaps to address before/after launch.

## Authentication

- **JWT**, signed with `JWT_SECRET` using HS256, payload `{ userId, role }`,
  **7-day** expiry. Verified in `backend/src/middleware/auth.js`.
- Tokens are stored client-side in **`sessionStorage`** (cleared when the tab
  closes) and sent as `Authorization: Bearer <token>`.
- See [Authentication & Authorization](./authentication.md) for the full flow.

## Passwords

- Hashed with **bcrypt** (10 salt rounds) in the `User` model pre-save hook;
  never stored or returned in plaintext.
- Strength enforced on signup and reset: ≥ 8 chars, with at least one uppercase,
  one lowercase, and one number.

## Authorization (RBAC)

- Backend: `auth` (verifies JWT) + `requireRole(...roles)` middleware
  (`backend/src/middleware/roles.js`). `401` when unauthenticated, `403` when the
  role isn't allowed.
- Frontend: `RequireRole` route guard redirects unauthenticated users to
  `/login` and wrong-role users to `/not-found`. **Frontend guards are UX only —
  the backend is the real boundary.**
- Full matrix in [Authentication › Role Permissions](./authentication.md#role-permissions-summary)
  and exercised by `tests/integration/security.test.js`.

## Privileged account creation

Reviewer and admin accounts require a shared secret:

- `POST /signup/reviewer` with `{ secret: REVIEWER_SIGNUP_SECRET }`
- `POST /signup/admin` with `{ secret: ADMIN_SIGNUP_SECRET }`

Secrets live in the backend `.env`, must be strong, and should be rotated after
launch.

## Rate limiting

Per-IP via `express-rate-limit` (`backend/src/middleware/rateLimit.js`), 15-min
window: `/login` 10, the three `/signup*` routes 5, `/forgot-password` 5.
Over-limit → `429`. Honours `DISABLE_RATE_LIMIT=true` for tests.

## HTTP hardening

- **helmet** sets security headers and removes `X-Powered-By`;
  `crossOriginResourcePolicy: cross-origin` because the API serves a separate
  frontend origin.
- **CORS** is driven by `CORS_ORIGIN`. **Production must set it to the real
  frontend origin** — never `*`. Empty = allow-all (dev only).
- No debug/test endpoints in the deployed app.

## Password reset tokens

A random 32-byte token is emailed; only its **SHA-256 hash** is stored, with a
1-hour expiry, single-use. (The email delivery side of forgot/reset password is
currently being finished by another team member — see the development guide.)

## Secrets management

All secrets come from environment variables (`backend/.env`, never committed).
See [Environment Variables](./environment-variables.md). `.env.example` files
document every variable with safe placeholders.

## Known gaps / hardening backlog

- Rate-limit store is **in-memory** — counters reset on restart and aren't shared
  across multiple backend instances. Use a shared store (e.g. Redis) if scaling out.
- `app.set('trust proxy', …)` must be configured in production so the limiter
  sees the real client IP behind the host's proxy (not yet set).
- No refresh-token rotation or server-side token revocation (tokens are valid
  until expiry).
- No email verification on signup and no account lockout beyond rate limiting.
- `sessionStorage` tokens are readable by any script on the page — keep the
  frontend free of untrusted third-party scripts / XSS.
