# Vite Proxy & Dev Setup

In development the React app (Vite dev server, `:5173`) and the Express API
(`:8000`) are two separate servers. Rather than configure CORS for the browser or
hardcode `http://localhost:8000` into every `fetch`, the frontend calls **relative
paths** (`/login`, `/applications/me`, …) and Vite's dev server **proxies** those
paths to the backend. This keeps the same-origin in dev and means no code change
is needed between dev and prod (see Production below).

**File:** `frontend/vite.config.js`

---

## The actual config

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const backendTarget = process.env.BACKEND_URL || "http://localhost:8000";

// Some backend routes share a path prefix with client-side routes (/login, /signup).
// When the browser NAVIGATES to those URLs (an HTML request), we must let Vite serve
// the SPA. Only API/XHR requests should be proxied to the backend.
const apiOnly = {
  target: backendTarget,
  changeOrigin: true,
  bypass(req) {
    if (req.headers.accept?.includes("text/html")) {
      return req.url; // serve index.html instead of proxying
    }
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/applications": apiOnly,
      "/signup": apiOnly,
      "/forgot-password": apiOnly,
      "/reset-password": apiOnly,
      "/login": apiOnly,
      "/questions": apiOnly,
      "/api/admin": apiOnly,
    },
  },
});
```

### The seven proxied prefixes

| Prefix | Backend routes it covers |
|--------|--------------------------|
| `/applications` | applicant + reviewer + admin application/review endpoints |
| `/signup` | `/signup`, `/signup/reviewer`, `/signup/admin` |
| `/login` | login |
| `/forgot-password` | request a reset email |
| `/reset-password` | set a new password |
| `/questions` | reserved for the (currently unused) `Question` model endpoints |
| `/api/admin` | all admin dashboard endpoints (`/api/admin/stats`, `/users`, …) |

Vite matches by **path prefix**, so `/applications` also catches
`/applications/me`, `/applications/123/submit`, `/applications/123/review`, etc.

### `changeOrigin`

Rewrites the outgoing `Host` header to the target (`localhost:8000`) so the
backend sees a request that looks like it was addressed to it directly.

### The `bypass` trick (important)

Several API prefixes collide with **client-side** routes — e.g. the user can
navigate the browser to `/login` or `/signup` (React Router pages) **and** the
frontend can `fetch('/login')` (API call). They share the path.

`bypass(req)` disambiguates by the `Accept` header:

- A **browser navigation** sends `Accept: text/html...` → `bypass` returns
  `req.url`, telling Vite **not** to proxy and to serve the SPA's `index.html`
  (React Router then renders the page client-side).
- A **`fetch`/XHR** call sends `Accept: application/json` (or `*/*`) → `bypass`
  returns `undefined` → Vite proxies it to the backend.

This is why typing `localhost:5173/login` shows the login **page**, while
`fetch('/login')` hits the **API**.

### `BACKEND_URL` override

The proxy target defaults to `http://localhost:8000` but can be overridden:

```bash
BACKEND_URL=http://localhost:9000 npm run dev      # bash
$env:BACKEND_URL="http://localhost:9000"; npm run dev   # PowerShell
```

Use this if you run the backend on a non-default `PORT`.

---

## How the frontend calls the API

The `apiUrl()` helper (`frontend/src/lib/api.js`) returns the path unchanged when
`VITE_API_BASE_URL` is unset:

```js
import { apiUrl } from '../lib/api'
// apiUrl('/applications/me') === '/applications/me'  (dev)
fetch(apiUrl('/applications/me'), { headers: { Authorization: `Bearer ${token}` } })
// → browser requests localhost:5173/applications/me
// → Vite proxy forwards to localhost:8000/applications/me
```

`apiUrl` throws if the path doesn't start with `/`, which catches accidental
absolute URLs early.

---

## Production (no Vite proxy)

In production the dev server doesn't exist, so the proxy is gone. Two options:

### Option 1 — `VITE_API_BASE_URL` (what this project is set up for)

Set it at **build time** so every API call is prefixed with the backend's public
origin:

```bash
VITE_API_BASE_URL=https://api.ignitionhacks.com npm run build
```

`apiUrl('/applications/me')` then returns
`https://api.ignitionhacks.com/applications/me`. The backend must allow the
frontend origin via `CORS_ORIGIN` (cross-origin now, so real CORS applies). A
trailing slash on the base URL is stripped automatically. See
[Environment Variables](./environment-variables.md) and `frontend/.env.example`.

### Option 2 — reverse proxy (Nginx, host platform)

Serve the built SPA and proxy the seven API prefixes to the backend at the edge,
mirroring what Vite does in dev. Then `VITE_API_BASE_URL` can stay empty (same
origin).

---

## Vite plugins

| Plugin | Purpose |
|--------|---------|
| `@vitejs/plugin-react` | React Fast Refresh (HMR) + JSX transform |
| `@tailwindcss/vite` | Tailwind CSS 4 build integration (Tailwind is installed; the app mostly uses hand-written CSS) |

---

## Build output

`npm run build` emits to `frontend/dist/`:

- `index.html` — SPA entry
- `assets/` — content-hashed JS, CSS, and images

`npm run preview` serves `dist/` locally so you can verify a production build
before deploying.

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server on :5173 (with the proxy above) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | ESLint |
| `BACKEND_URL=… npm run dev` | Dev server pointed at a non-default backend port |
