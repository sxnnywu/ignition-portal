# Vite Proxy & Dev Setup

## How the Proxy Works

In development, the React frontend runs on `localhost:5173` (Vite dev server) and the Express backend runs on `localhost:8000`. To avoid CORS issues and simplify API calls, Vite's built-in proxy intercepts certain URL prefixes and forwards them to the backend.

**File:** `frontend/vite.config.js`

### Proxied Paths

| Path Prefix | Target | Example |
|-------------|--------|---------|
| `/applications` | `http://localhost:8000` | `/applications/reviewer` → `http://localhost:8000/applications/reviewer` |
| `/signup` | `http://localhost:8000` | `/signup` → `http://localhost:8000/signup` |
| `/forgot-password` | `http://localhost:8000` | `/forgot-password` → `http://localhost:8000/forgot-password` |
| `/reset-password` | `http://localhost:8000` | `/reset-password` → `http://localhost:8000/reset-password` |
| `/login` | `http://localhost:8000` | `/login` → `http://localhost:8000/login` |

All proxied paths use `changeOrigin: true` to modify the `Host` header to match the target.

### How It's Used in Code

The `apiUrl()` helper (`frontend/src/lib/api.js`) returns the path as-is when no `VITE_API_BASE_URL` is set:

```javascript
// apiUrl('/applications/reviewer') returns '/applications/reviewer'
// The fetch call goes to localhost:5173/applications/reviewer
// Vite proxy catches it and forwards to localhost:8000/applications/reviewer
```

### Path Matching

Vite matches the **beginning** of the URL path. So `/applications` matches:
- `/applications`
- `/applications/me`
- `/applications/reviewer`
- `/applications/123/submit`
- `/applications/123/review`

### Static Assets vs API Calls

Vite distinguishes between:
1. **HTML page navigation** (e.g., typing `localhost:5173/login` in the browser) → serves the SPA's `index.html` (React Router handles routing client-side)
2. **API calls** (e.g., `fetch('/login')` from JavaScript) → proxied to the backend

This works because Vite's dev server has SPA fallback built in — it serves `index.html` for GET requests that don't match static files, while the proxy only intercepts API requests.

## Production Setup

In production, the proxy does not exist. You have two options:

### Option 1: Set VITE_API_BASE_URL
Set the environment variable before building:
```bash
VITE_API_BASE_URL=https://api.ignitionhacks.com npm run build
```

All API calls will be prefixed with the full backend URL.

### Option 2: Reverse Proxy (Nginx, etc.)
Configure your web server to proxy `/applications`, `/signup`, `/login`, etc. to the backend, similar to what Vite does in development.

## Vite Plugins

The Vite config includes two plugins:

1. **`@vitejs/plugin-react`** — Enables React Fast Refresh (HMR) and JSX transform
2. **`@tailwindcss/vite`** — Integrates Tailwind CSS 4's build process

## Build Output

```bash
npm run build
```

Outputs to `frontend/dist/`:
- `index.html` — SPA entry point
- `assets/` — Hashed JS, CSS, and image files

## Dev Server Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
