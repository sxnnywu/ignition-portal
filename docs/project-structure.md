# Project Structure

A complete, annotated map of the repository. Paths are relative to the repo root.

## Root

```
ignition-portal/
├── backend/               Express.js REST API (Node 18+, port 8000)
├── frontend/              React 19 SPA (Vite 7, port 5173)
├── tests/                 Backend end-to-end / integration test suite (Vitest)
├── docs/                  Documentation (this folder)
├── DEVELOPMENT-GUIDE.md   Project explanation + task prompts for remaining work
├── README.md              Top-level readme
└── package-lock.json      Stray root lockfile (no root package.json; can be ignored)
```

There is **no root `package.json`** — `backend/`, `frontend/`, and `tests/` are
three independent npm packages, each installed separately.

---

## Backend

```
backend/
├── .env                   Secrets & config (NOT committed; copy from .env.example)
├── .env.example           Documented template for .env
├── package.json           Deps + scripts (dev/start/test)
├── package-lock.json
├── node_modules/          ⚠ currently COMMITTED to git (anti-pattern; slated for cleanup)
└── src/
    ├── index.js           Production entry: dotenv → connectDB() → createApp().listen(PORT)
    ├── app.js             createApp(): builds the Express app (helmet → CORS → JSON → routes),
    │                       NO DB connect and NO listen. Imported by index.js AND the tests.
    ├── config/
    │   └── db.js          connectDB() (mongoose.connect(MONGO_URI)); also re-exports the
    │                       shared `mongoose` instance so tests register models on it.
    ├── middleware/
    │   ├── auth.js        Verifies `Authorization: Bearer <jwt>`, sets req.user = {userId, role}
    │   ├── roles.js       requireRole(...allowed): 401 if no user, 403 if role not allowed
    │   └── rateLimit.js   Per-IP express-rate-limit limiters for the auth routes
    ├── models/
    │   ├── User.js        name, email(unique,lowercased), role enum, bcrypt password, reset fields
    │   ├── Application.js  Structured slices: personal/education/experience/teammates/responses
    │   │                   + status enum, version, submittedAt. Indexes on userId & status+submittedAt.
    │   ├── Review.js      applicationId, reviewerId, scores(Map), totalScore, comment.
    │   │                   Unique index on (applicationId, reviewerId).
    │   ├── Question.js    key/label/type/order — ⚠ NOT wired into any route
    │   ├── File.js        applicationId/fileName/storagePath/uploadedBy — ⚠ NOT wired in
    │   └── ActivityLog.js actorId/action/meta — ⚠ NOT wired in
    └── routes/
        ├── signup.js      Auth: POST /signup, /signup/reviewer, /signup/admin, /login,
        │                   /forgot-password, /reset-password (+ rate limiters, mailer)
        ├── applications.js Applicant + reviewer endpoints under /applications/*
        └── admin.js       Admin dashboard under /api/admin/* (stats, lists, CSV, user mgmt)
```

### Route mounting (in `app.js`)

| Mount point | Router file | Example full path |
|-------------|-------------|-------------------|
| `/applications` | `applications.js` | `GET /applications/me` |
| `/api/admin` | `admin.js` | `GET /api/admin/stats` |
| `/` | `signup.js` | `POST /login` |

### Unused models

`Question`, `File`, and `ActivityLog` are defined but **not referenced by any
route**. They're either scaffolding for planned features (file upload, audit log,
configurable questions) or dead code. Decide per task — see `DEVELOPMENT-GUIDE.md`
task **D1**.

---

## Frontend

```
frontend/
├── .env.example           Template documenting VITE_API_BASE_URL
├── .gitignore             ignores node_modules, .env*, dist (with !.env.example)
├── package.json           Deps + scripts (dev/build/preview/lint)
├── vite.config.js         Plugins (react, tailwind) + dev API proxy
├── index.html             SPA shell; loads /src/main.jsx
├── node_modules/          (gitignored)
├── dist/                  Production build output (generated)
└── src/
    ├── main.jsx           Entry: builds the router from routes.jsx, renders <RouterProvider>
    ├── index.css          Global styles + Tailwind import + body reset
    │
    ├── routes/
    │   └── routes.jsx     All route objects; role-specific routes wrapped in <RequireRole>
    │
    ├── lib/
    │   ├── api.js                  apiUrl(path): prefixes VITE_API_BASE_URL when set
    │   ├── auth.js                 getToken/getUser/setAuth/clearAuth over sessionStorage
    │   ├── cache.js                Module-level TTL cache + invalidation helpers
    │   ├── applicationDraft.jsx    <ApplicationDraftProvider>: load-once draft, autosave, in-memory state
    │   └── applicationDraftContext.js  React context + useApplicationDraft() hook
    │
    ├── hooks/
    │   └── useCachedFetch.js       Cache-first data-fetching hook (uses lib/cache.js)
    │
    ├── assets/
    │   ├── logo.svg, iggy.svg
    │   ├── backgrounds/            app-(accepted|submitted|underreview)-bg.png, header.svg,
    │   │   ├── hacker-application/ hacker-application-background-with-white.svg, login-mascot.svg
    │   │   ├── info-check-circle.svg, landing-cloud.svg, landing-iggy.svg, sign-up-bg.png
    │   ├── buttons/signup-button.png
    │   └── icons/                  ignition-logo.svg, Article-icon.svg, clock-icon.svg, check-mark-icon.svg
    │
    ├── components/
    │   ├── auth/RequireRole.jsx         Route guard: no token → /login, wrong role → /not-found
    │   ├── hacker/UserIdBadge.(jsx|css) Top-right "Your User ID" badge on hacker pages
    │   ├── portal/                      Shared reviewer/admin chrome:
    │   │   ├── PortalLayout.(jsx|css)   Layout wrapper (navbar + <Outlet/>)
    │   │   ├── PortalNavBar.(jsx|css)   Top navbar
    │   │   └── PortalSidebar.(jsx|css)  Sidebar with filter items + children
    │   └── shared/                      Cross-portal UI primitives:
    │       ├── StatusBadge, AvatarInitials, FilterTabs, Pagination, ConfirmModal (jsx + css)
    │       └── Icons.jsx                Inline SVG icon set
    │
    ├── pages/
    │   ├── NotFound.(jsx|css)           404 page
    │   ├── auth/
    │   │   ├── Login.(jsx|css)          Login (Login.css is shared by Login/Forgot/Reset)
    │   │   ├── Signup.(jsx|css)         Applicant signup
    │   │   ├── ReviewerSignup.jsx       Reviewer signup (secret-gated; old image design)
    │   │   ├── AdminSignup.jsx          Admin signup (secret-gated; old image design)
    │   │   ├── ForgotPassword.jsx       Request reset email (reuses Login.css)
    │   │   └── ResetPassword.jsx        Set new password (reuses Login.css)
    │   └── hacker/
    │       ├── Dashboard.(jsx|css)      Status-aware applicant dashboard
    │       ├── Landing.(jsx|css)        Welcome page — routed at /landing but UNLINKED
    │       ├── Info.(jsx|css)           Step 1: personal info
    │       ├── Education.(jsx|css)      Step 2: education + hackathon experience
    │       ├── Teammates.(jsx|css)      Step 3: teammates by user-id lookup
    │       ├── Questions.(jsx|css)      Step 4: three written responses
    │       ├── FinishApp.(jsx|css)      Step 5: review & submit
    │       └── portal.css               Shared hacker-form layout styles
    │
    ├── admin/
    │   ├── AdminApp.(jsx|css)           Admin portal root (sidebar + routing)
    │   ├── api/adminApi.js              Admin-specific fetch wrappers
    │   ├── pages/
    │   │   ├── AllApplications.(jsx|css)        Paginated/filterable application table
    │   │   ├── AdminApplicationDetail.(jsx|css) Single application (scores + comments)
    │   │   └── UserManagement.(jsx|css)         Create / change-role / delete users
    │   └── components/AddUserModal.(jsx|css)    Modal to create a user
    │
    └── reviewer/
        ├── pages/
        │   ├── ReviewerMainPage.(jsx|css)            Reviewer dashboard
        │   └── ReviewerApplicationDetail.(jsx|css)   Scoring rubric + comment
        └── components/ApplicationTable.(jsx|css)     Sortable, paginated table
```

> Note: admin/reviewer portal CSS has **no `@media` queries** yet — those portals
> aren't mobile-responsive (see `DEVELOPMENT-GUIDE.md` task **D3**).

---

## Tests

```
tests/
├── package.json           vitest, supertest, mongodb-memory-server, jsonwebtoken
├── vitest.config.js       include globs, globalSetup, setupFiles, sequential run
├── globalSetup.js         Starts ONE in-memory mongod for the whole run; shares URI via env
├── setup.js               Per-file: connects backend mongoose to it; wipes collections each test;
│                          sets test secrets + DISABLE_RATE_LIMIT=true
├── .gitignore             ignores node_modules/, coverage/
├── README.md
├── helpers/
│   ├── app.js             createApp() + supertest api() factory
│   └── factories.js       createApplicant/Reviewer/Admin, valid payloads, submitted-app helper
├── integration/
│   ├── auth.test.js
│   ├── applications.test.js
│   ├── submit.test.js
│   ├── teammates.test.js
│   ├── reviews.test.js
│   ├── admin.test.js
│   ├── security.test.js
│   ├── password-reset.test.js
│   └── rate-limit.test.js
└── unit/
    └── models.test.js
```

See [Testing](./testing.md) for what each suite covers and how to run/write tests.

---

## Key files at a glance

| File | One-liner |
|------|-----------|
| `backend/src/app.js` | Builds the Express app (no DB/listen) — shared by prod + tests |
| `backend/src/index.js` | Connects DB, then starts the server |
| `backend/src/config/db.js` | `connectDB()` + shared `mongoose` export |
| `backend/src/middleware/auth.js` | JWT verification → `req.user` |
| `backend/src/middleware/roles.js` | `requireRole(...)` role gate |
| `backend/src/middleware/rateLimit.js` | Per-IP auth rate limiters |
| `backend/src/routes/signup.js` | Auth endpoints + mailer |
| `backend/src/routes/applications.js` | Application + review endpoints |
| `backend/src/routes/admin.js` | Admin dashboard endpoints |
| `frontend/src/main.jsx` | React entry, builds the router |
| `frontend/src/routes/routes.jsx` | All routes + role guards |
| `frontend/src/lib/api.js` | `apiUrl()` |
| `frontend/src/lib/auth.js` | sessionStorage token/user helpers |
| `frontend/src/lib/applicationDraft.jsx` | Draft provider for the application steps |
| `frontend/vite.config.js` | Dev proxy + plugins |
| `tests/` | Backend test suite — [Testing](./testing.md) |
