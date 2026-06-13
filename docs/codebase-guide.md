# Codebase Guide (start here)

A fast orientation to the whole project. Read this first, then dive into the
focused docs linked throughout. If you only read one file, read this one.

## What this is

**Ignition Portal** is the web app for **Ignition Hacks V7**, a hackathon. It has
three user roles:

- **Applicant (hacker)** — signs up, fills a multi-step application, submits it.
- **Reviewer** — views submitted applications and scores them with a rubric + comment.
- **Admin** — everything reviewers can do, plus stats, status decisions
  (accept/waitlist/reject), CSV export, and user management.

## Monorepo layout

```
ignition-portal/
├── backend/     Express + Mongoose REST API (Node 18+, port 8000)
├── frontend/    React 19 SPA (Vite 7, port 5173)
├── tests/       Backend integration/unit test suite (Vitest + Supertest)
├── docs/        This documentation
└── DEVELOPMENT-GUIDE.md  Project explanation + task prompts for remaining work
```

Full annotated tree: [Project Structure](./project-structure.md).

## Running it

See [Getting Started](./getting-started.md). In short: backend needs a
`backend/.env` (copy `backend/.env.example`); run the backend (`npm run dev` in
`backend/`) and the frontend (`npm run dev` in `frontend/`). The Vite dev server
proxies `/api`-style paths to the backend — see [Vite Proxy](./vite-proxy.md).

## Backend architecture

- **`src/app.js`** — `createApp()` builds the Express app (helmet → CORS → JSON →
  routes) with **no** DB connection or `listen`. Imported by both production and
  tests.
- **`src/index.js`** — connects to MongoDB then `createApp().listen()`.
- **`src/config/db.js`** — `connectDB()` + a re-exported shared `mongoose`.
- **`src/routes/`** — `signup.js` (auth: signup/login/reset + rate limiters),
  `applications.js` (applicant + reviewer endpoints), `admin.js` (`/api/admin/*`).
- **`src/middleware/`** — `auth.js` (JWT verify), `roles.js` (`requireRole`),
  `rateLimit.js` (per-IP auth limiters).
- **`src/models/`** — Mongoose models (below). `Question`, `File`, `ActivityLog`
  exist but are **not yet wired into routes**.

Endpoint-by-endpoint detail: [API Reference](./api-reference.md). Auth/RBAC:
[Authentication](./authentication.md) and [Security](./security.md).

## Data model (the important three)

- **User** — `name`, `email` (unique), `role` (`applicant`/`reviewer`/`admin`),
  bcrypt `password`, reset-token fields.
- **Application** — one per user. **Structured slices**, not a free-form blob:
  `personal`, `education`, `experience`, `teammates[]` (max 3, server-derived),
  `responses` (3 char-capped answers), plus `status` and `version`.
- **Review** — one per `(application, reviewer)` (unique index): `scores` map,
  `totalScore`, `comment`.

Field-by-field: [Database Models](./database-models.md).

## Request lifecycle (typical protected call)

```
Frontend fetch(apiUrl('/applications/me'), { Authorization: Bearer <jwt> })
  → Vite proxy (dev) → Express
  → auth middleware (verify JWT, set req.user)
  → requireRole(...) if the route is role-gated
  → route handler → Mongoose → MongoDB
  → JSON response
```

## Frontend architecture

- **`src/routes/routes.jsx`** — React Router route objects; role-specific routes
  are wrapped in `RequireRole`. See [Frontend Routing](./frontend-routing.md).
- **`src/lib/api.js`** — `apiUrl()` (prefixes `VITE_API_BASE_URL` when set).
- **`src/lib/auth.js`** — `getToken/getUser/setAuth/clearAuth` (sessionStorage).
- **`src/lib/applicationDraft.jsx`** — `ApplicationDraftProvider` context that
  loads/holds the draft and autosaves; wraps the 5 application steps.
- **Pages** by role under `src/pages/` (auth, hacker) and `src/admin/`,
  `src/reviewer/`. Shared portal chrome in `src/components/portal/`.
- **CSS** uses per-component class prefixes and a cream/brown palette — see
  [CSS Architecture](./css-architecture.md). Auth + hacker pages are responsive;
  the admin/reviewer portals are **not yet** mobile-responsive.

Page-by-page: [Auth](./frontend-pages-auth.md), [Hacker](./frontend-pages-hacker.md),
[Reviewer](./frontend-pages-reviewer.md), [Shared Components](./shared-components.md).

## The user journeys

- Applicant: [Application Flow — Applicant](./flow-applicant.md)
- Reviewer: [Application Flow — Reviewer](./flow-reviewer.md)

## Testing

Backend has a full suite in `tests/` (130 tests, Vitest + Supertest +
mongodb-memory-server). Run `cd tests && npm test`. The frontend has **no
component tests yet** (validated by `npm run lint` + `npm run build`). See
[Testing](./testing.md).

## Conventions worth knowing

- The server is the source of truth: teammate name/email and all validation are
  re-derived server-side; never trust the client payload.
- Drafts may be partial; full required-field validation happens on **submit**.
- Backend uses ES modules (`"type": "module"`).
- `backend/node_modules` is currently committed (an anti-pattern flagged for
  cleanup); `frontend/` and `tests/` ignore theirs.

## Where to look (task → start here)

| Task | Start in |
|------|----------|
| Add/modify an API endpoint | `backend/src/routes/*` + [API Reference](./api-reference.md) |
| Change the data model | `backend/src/models/*` + [Database Models](./database-models.md) |
| Auth / permissions | `backend/src/middleware/*` + [Authentication](./authentication.md) / [Security](./security.md) |
| Applicant UI | `frontend/src/pages/hacker/*` + [Hacker pages](./frontend-pages-hacker.md) |
| Reviewer/Admin UI | `frontend/src/reviewer/*`, `frontend/src/admin/*` |
| Routing / guards | `frontend/src/routes/routes.jsx` + [Frontend Routing](./frontend-routing.md) |
| Styling | the component's `.css` + [CSS Architecture](./css-architecture.md) |
| Tests | `tests/` + [Testing](./testing.md) |
| Config / secrets | `.env.example` files + [Environment Variables](./environment-variables.md) |
| What's left to build | `DEVELOPMENT-GUIDE.md` (root) |
