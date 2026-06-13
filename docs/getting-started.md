# Getting Started

This guide takes you from a fresh clone to a fully running local stack (backend +
frontend + tests), with troubleshooting and account-seeding recipes. It assumes
no prior knowledge of the project.

---

## 1. Prerequisites

| Tool | Version | Check | Notes |
|------|---------|-------|-------|
| **Node.js** | 18 LTS or higher (20+ recommended) | `node -v` | The backend uses ES modules + top-level `await`; Node 18+ required. |
| **npm** | 9+ (ships with Node) | `npm -v` | Yarn/pnpm work too but the repo ships `package-lock.json`. |
| **Git** | any recent | `git --version` | |
| **MongoDB** | Atlas cluster **or** local `mongod` 6+ | — | Atlas free tier (M0) is fine for dev. |

There are **three** separate npm packages, each with its own `package.json` and
`node_modules`: `backend/`, `frontend/`, and `tests/`. You install each one
independently — there is no root install.

> **Windows note:** all commands below work in PowerShell, Git Bash, or WSL.
> Where a command differs, the PowerShell form is noted. This repo is developed on
> Windows; line endings are normalized by Git (`LF` in the repo, `CRLF` in the
> working copy — the "LF will be replaced by CRLF" warning on `git add` is benign).

---

## 2. Clone

```bash
git clone <repository-url>
cd ignition-portal
```

The default branch is `main`. Confirm with `git branch --show-current`.

---

## 3. MongoDB: get a connection string

### Option A — MongoDB Atlas (recommended)

1. Create a free account at <https://www.mongodb.com/atlas> and create an **M0**
   cluster.
2. **Database Access** → add a database user (username + password). Save the password.
3. **Network Access** → add your IP (or `0.0.0.0/0` for dev — do **not** use that
   in production).
4. **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Insert the database name** between the host and the `?`. This is the single
   most common setup mistake — without it Mongoose silently uses a DB named
   `test`:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ignition-portal?retryWrites=true&w=majority
   ```

### Option B — Local MongoDB

Install MongoDB Community, start `mongod`, and use:
```
MONGO_URI=mongodb://127.0.0.1:27017/ignition-portal
```

---

## 4. Backend setup

```bash
cd backend
npm install
```

### Create `backend/.env`

Copy the template and fill it in:

```bash
cp .env.example .env        # PowerShell: Copy-Item .env.example .env
```

Minimum to boot locally (the rest can stay as placeholders until needed):

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ignition-portal?retryWrites=true&w=majority
JWT_SECRET=any_long_random_string_for_dev
CORS_ORIGIN=http://localhost:5173
REVIEWER_SIGNUP_SECRET=dev-reviewer-secret
ADMIN_SIGNUP_SECRET=dev-admin-secret
PORT=8000
# Email vars are only needed for the (in-progress) password-reset emails:
EMAIL_SERVICE=gmail
EMAIL_USER=
EMAIL_PASSWORD=
FRONTEND_URL=http://localhost:5173
```

See [Environment Variables](./environment-variables.md) for a full explanation of
each variable, and how to obtain a Gmail **App Password** (the email vars).

> The variable is **`MONGO_URI`** (read in `src/config/db.js`). `MONGODB_URI` will
> NOT work.

### Start the backend

```bash
npm run dev     # nodemon — auto-restarts on file changes (development)
# or
npm start       # node src/index.js (production-style, no auto-restart)
```

On success you'll see:

```
MongoDB connected successfully
Server running on port 8000
```

If you see `MongoDB connection failed`, fix `MONGO_URI` (see Troubleshooting).
The process intentionally `process.exit(1)`s on a failed DB connection.

### Quick health check

```bash
# any unknown route returns Express's default 404 HTML, which proves it's up:
curl -i http://localhost:8000/login -X POST -H "Content-Type: application/json" -d '{}'
# → HTTP/1.1 400 Bad Request  {"message":"Email and password are required."}
```

---

## 5. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

Vite starts on <http://localhost:5173> and proxies API paths to the backend on
`:8000` (see [Vite Proxy](./vite-proxy.md)). Open the URL and you should see the
login page.

Frontend scripts:

| Command | What it does |
|---------|--------------|
| `npm run dev` | Vite dev server + HMR on :5173 |
| `npm run build` | Production build to `frontend/dist/` |
| `npm run preview` | Serve the built `dist/` locally to sanity-check a build |
| `npm run lint` | ESLint 9 (react-hooks, react-refresh rules) |

---

## 6. Running both at once

Use two terminals:

```bash
# Terminal 1
cd backend && npm run dev
```
```bash
# Terminal 2
cd frontend && npm run dev
```

Then browse to <http://localhost:5173>.

---

## 7. Running the tests

The backend test suite lives in the top-level `tests/` folder and runs against an
**in-memory MongoDB** — no real database, no running backend required.

```bash
cd tests
npm install     # first run only — downloads a mongod binary for mongodb-memory-server
npm test        # run once
npm run test:watch   # watch mode
```

Expected: `Test Files  10 passed (10)` / `Tests  130 passed (130)`.

The first run downloads a ~60 MB mongod binary (cached afterward under the
mongodb-memory-server cache). If your network blocks that download, set
`MONGOMS_DOWNLOAD_MIRROR` or pre-provide a binary — see the mongodb-memory-server
docs. Full coverage details: [Testing](./testing.md).

---

## 8. Seeding accounts

### Applicant (via UI or API)

UI: <http://localhost:5173/signup>. API:

```bash
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password123"}'
```

Password rules: ≥ 8 chars, with at least one uppercase, one lowercase, and one
number. Name: letters and spaces only.

### Reviewer (needs `REVIEWER_SIGNUP_SECRET`)

```bash
curl -X POST http://localhost:8000/signup/reviewer \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Smith","email":"jane@example.com","password":"Password123","secret":"dev-reviewer-secret"}'
```

### Admin (needs `ADMIN_SIGNUP_SECRET`)

```bash
curl -X POST http://localhost:8000/signup/admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"Password123","secret":"dev-admin-secret"}'
```

Each returns `{ token, user }`. Save the `token` to call protected endpoints:

```bash
TOKEN=eyJhbG...   # paste from the signup/login response
curl http://localhost:8000/applications/me -H "Authorization: Bearer $TOKEN"
```

> **PowerShell** equivalents: use `Invoke-RestMethod`:
> ```powershell
> $r = Invoke-RestMethod -Method Post http://localhost:8000/login -ContentType application/json -Body '{"email":"john@example.com","password":"Password123"}'
> $r.token
> ```

After login the frontend redirects by role: applicants → `/dashboard`, reviewers
& admins → `/reviewer` (admins reach the admin portal from there).

---

## 9. Typical day-to-day commands

```bash
# backend hot-reload
cd backend && npm run dev

# frontend hot-reload
cd frontend && npm run dev

# run the full backend test suite before pushing backend changes
cd tests && npm test

# lint + build the frontend before pushing frontend changes
cd frontend && npm run lint && npm run build
```

These four are the "definition of done" gates referenced throughout the docs.

---

## 10. Troubleshooting

| Symptom | Cause / Fix |
|---------|-------------|
| `MongoDB connection failed: ...` then process exits | Bad `MONGO_URI`. Verify user/password, that your IP is allow-listed in Atlas Network Access, and that the **database name** sits between the host and the `?`. |
| Backend boots but every protected call is `401` | Token expired (7-day expiry), or it was signed with a different `JWT_SECRET`/database. Clear `sessionStorage` (F12 → Application → Session Storage → Clear) and log in again. |
| `ECONNREFUSED` / network error from the frontend | Backend isn't running on :8000, or you changed `PORT` without updating the Vite proxy target (`BACKEND_URL`). |
| `403 Unauthorized.` on `/signup/reviewer` or `/signup/admin` | Wrong or missing `secret` in the request body (must match `REVIEWER_SIGNUP_SECRET` / `ADMIN_SIGNUP_SECRET`). |
| `429 Too many ...` on login/signup | Rate limiter tripped (per-IP). Wait the 15-minute window, or restart the backend (the limiter store is in-memory). |
| Blank page on `/reviewer` | You're logged in as an applicant, or stale session. Clear `sessionStorage` and log in with a reviewer/admin account. |
| `Cannot find module ...` | Run `npm install` in the relevant folder (`backend/`, `frontend/`, or `tests/`). |
| Tests hang on first run | mongodb-memory-server is downloading its binary; let it finish (can take a minute). |
| `JWT_SECRET is not defined` thrown on signup/login | `JWT_SECRET` missing from `backend/.env`. |

---

## 11. Where to go next

- [Codebase Guide](./codebase-guide.md) — orientation to the whole project.
- [Architecture Overview](./architecture-overview.md) — how it all fits together.
- [API Reference](./api-reference.md) — every endpoint with examples.
- `DEVELOPMENT-GUIDE.md` (repo root) — the remaining work, as task prompts.
