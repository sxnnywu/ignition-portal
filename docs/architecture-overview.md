# Architecture Overview

## System Design

Ignition Portal is a monorepo containing two standalone applications that communicate over HTTP:

```
ignition-portal/
├── backend/    ← Express.js REST API  (Node 18+, port 8000)
├── frontend/   ← React 19 SPA        (Vite 7, port 5173)
├── tests/      ← End-to-end API tests (Vitest + supertest + in-memory MongoDB)
└── docs/       ← This documentation
```

### Request Flow (Development)

```
Browser (localhost:5173)
   │
   ├── Static assets (.jsx, .css, images) ──→ Vite dev server (serves directly)
   │
   └── API calls (/applications/*, /login, /signup, etc.)
           │
           └── Vite proxy ──→ Express backend (localhost:8000)
                                    │
                                    └── MongoDB Atlas (cloud)
```

In development, the Vite dev server intercepts API paths (configured in `vite.config.js`) and proxies them to the Express backend. The frontend never calls `localhost:8000` directly — all requests go through `localhost:5173`.

## Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 5.1 | HTTP framework |
| Mongoose | 8.20 | MongoDB ODM |
| MongoDB Atlas | — | Cloud database |
| JWT (jsonwebtoken) | 9.0 | Authentication tokens |
| bcryptjs | 3.0 | Password hashing |
| nodemailer | 8.0 | Password reset emails |
| helmet | 8.2 | Security HTTP headers |
| express-rate-limit | 8.5 | Auth-route rate limiting |
| dotenv | 17.2 | Environment variable loading |
| nodemon | 3.1 | Dev auto-restart |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2 | UI library |
| React Router DOM | 7.13 | Client-side routing |
| Vite | 7.3 | Build tool & dev server |
| Tailwind CSS | 4.2 | Utility CSS (imported but mostly custom CSS is used) |
| Axios | 1.13 | HTTP client (installed but `fetch` is used in practice) |
| Lucide React | 0.577 | Icons (installed, not widely used yet) |
| React Query | 5.90 | Data fetching (installed, not yet integrated) |

## Key Design Decisions

### 1. Session-Based Auth via sessionStorage
Authentication tokens and user data are stored in `sessionStorage` (not `localStorage`). This means:
- Data is cleared when the browser tab closes
- Each tab has its own session
- More secure than localStorage for sensitive tokens

### 2. Role-Based Architecture
The system has three roles with increasing privilege:
- **applicant** — can fill out and submit hackathon applications
- **reviewer** — can view all submitted applications and score them
- **admin** — has all reviewer permissions plus admin-specific capabilities

Role enforcement happens at two levels:
- **Backend**: JWT middleware extracts the role, then `requireRole()` middleware blocks unauthorized access
- **Frontend**: `RequireRole` component redirects users away from pages they cannot access

### 3. CSS Class Prefixing
To prevent class name collisions across the growing codebase, every component group uses a unique prefix:
- `login-` — login, forgot & reset password (shared `Login.css`)
- `signup-` — signup pages
- `hp-` — hacker application form (shared step layout)
- `hk-dash-` — hacker dashboard
- `hk-landing-` — hacker landing page
- `rv-` / `rev-` — reviewer main page & application detail
- `admin-` — admin portal pages
- `portal-` — shared portal components (navbar, sidebar)
- `notfound-` — 404 page

### 4. Decoupled SVG Background + Content Container
The hacker application form and the auth pages render a full-bleed SVG
illustration as the page background, with the cream `#FFF9F2` sheet acting as the
actual content container. Text and inputs live inside that container and scale
responsively (`clamp()`, container queries) rather than being absolutely
positioned over a fixed-size raster. This keeps the layout professional across
all viewport widths and heights instead of relying on one pixel-perfect image.

### 5. Testable Backend Entry Point
The backend is split into `app.js` (builds and exports the configured Express
app, with **no** database connection or `listen` side effects) and `index.js`
(loads env, connects to MongoDB, then starts the server). This lets the
`tests/` suite import the real app and exercise it over HTTP against an
in-memory MongoDB — see [Testing](./testing.md).

### 6. Vite Dev Proxy
Instead of configuring CORS for every endpoint or using a full `VITE_API_BASE_URL`, the project uses Vite's built-in proxy. The frontend makes relative API calls (`/applications/reviewer`) and Vite forwards them to `localhost:8000`. This simplifies development and avoids CORS issues.

## Security Hardening

The Express app is assembled by `createApp()` in `backend/src/app.js` (imported by both `index.js` in production and the test suite). It applies, in order:

- **helmet** — sets security headers (e.g. `X-Content-Type-Options: nosniff`, HSTS) and removes the `X-Powered-By` fingerprint. `crossOriginResourcePolicy` is set to `cross-origin` because the API is consumed by a separately-hosted frontend.
- **CORS** — driven by `CORS_ORIGIN`. **In production this must list the real frontend origin(s);** never `*`. The allow-all fallback (`origin: true`) applies only when `CORS_ORIGIN` is unset, which should be local development only.
- **Rate limiting** (`backend/src/middleware/rateLimit.js`, applied per-route in `routes/signup.js`) on the abuse-prone auth endpoints, keyed by client IP over a 15-minute window:
  - `POST /login` — 10 attempts (brute-force defence)
  - `POST /signup`, `/signup/reviewer`, `/signup/admin` — 5 attempts (spam defence)
  - `POST /forgot-password` — 5 attempts (spam + email-flood defence)

  Over-limit requests get `429` with a JSON `message`. The limiter honours `DISABLE_RATE_LIMIT=true` so the test suite isn't throttled. Behind a reverse proxy in production, set `app.set('trust proxy', …)` so the real client IP is used.

There are no debug/test endpoints in the deployed app (the old `/api/test` route and `test.js` have been removed).

## Communication Between Frontend and Backend

All API communication uses the native `fetch()` API (not Axios, despite it being installed). The pattern is:

1. Frontend calls `apiUrl('/some-path')` which returns the path as-is (no base URL prefix in dev)
2. `fetch()` sends the request to `localhost:5173/some-path`
3. Vite proxy matches the path prefix and forwards to `localhost:8000/some-path`
4. Express handles the request and returns JSON
5. Frontend processes the JSON response

Authentication is done via the `Authorization: Bearer <token>` header on every protected request.
