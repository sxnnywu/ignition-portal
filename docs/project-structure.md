# Project Structure

## Root

```
ignition-portal/
├── backend/               ← Express.js REST API
├── frontend/              ← React 19 SPA (Vite)
├── tests/                 ← End-to-end API test suite (Vitest + supertest)
├── docs/                  ← Documentation (this folder)
├── package-lock.json      ← Root lockfile
└── README.md              ← Project readme
```

## Backend

```
backend/
├── .env                   ← Environment variables (not committed)
├── package.json           ← Dependencies and scripts
├── node_modules/          ← Installed packages
└── src/
    ├── index.js           ← Production entry: load env, connect DB, build app, listen
    ├── app.js             ← Builds & exports the configured Express app (no DB/listen
    │                         side effects) — used by index.js and the test suite
    ├── config/
    │   └── db.js          ← MongoDB connection using Mongoose (also re-exports mongoose)
    ├── middleware/
    │   ├── auth.js        ← JWT token verification middleware (sets req.user)
    │   └── roles.js       ← Role-based access control middleware (requireRole)
    ├── models/
    │   ├── User.js        ← User schema: name, email, password, role, reset token
    │   ├── Application.js ← Application schema: structured personal/education/
    │   │                     experience/teammates/responses slices, status, version
    │   ├── Review.js      ← Review schema: applicationId, reviewerId, scores, totalScore, comment
    │   ├── Question.js    ← Question schema: key, label, type, order (config/testing)
    │   ├── File.js        ← File schema: applicationId, fileName, storagePath (not yet used)
    │   └── ActivityLog.js ← ActivityLog schema: actorId, action, meta (not yet used)
    └── routes/
        ├── signup.js      ← Auth routes: /signup, /signup/reviewer, /signup/admin,
        │                     /login, /forgot-password, /reset-password
        ├── applications.js ← Application & review CRUD: /applications/*
        └── admin.js       ← Admin dashboard: stats, paginated lists, CSV export, user mgmt
```

### Route Mounting

In `app.js`:
```
/applications   → applications.js
/api/admin      → admin.js
/               → signup.js (so /signup, /login, etc. are at root level)
```

---

## Frontend

```
frontend/
├── package.json            ← Dependencies and scripts
├── vite.config.js          ← Vite config: plugins, dev proxy
├── index.html              ← SPA entry HTML (loads main.jsx)
├── node_modules/           ← Installed packages
├── dist/                   ← Production build output (generated)
├── public/                 ← Static assets served as-is
└── src/
    ├── main.jsx            ← App entry: creates router, renders to DOM
    ├── index.css           ← Global styles: Tailwind import, body reset
    │
    ├── routes/
    │   └── routes.jsx      ← Centralized route configuration
    │
    ├── lib/
    │   ├── auth.js         ← Auth helpers: getToken, getUser, setAuth, clearAuth
    │   ├── api.js          ← API URL helper: apiUrl() adds optional base URL
    │   ├── cache.js        ← Module-level TTL cache with invalidation helpers
    │   ├── applicationDraft.jsx        ← ApplicationDraftProvider (load-once draft, in-memory)
    │   └── applicationDraftContext.js  ← Draft context + useApplicationDraft hook
    │
    ├── assets/
    │   ├── backgrounds/
    │   │   ├── hacker-application/
    │   │   │   ├── hacker-application-background-with-white.svg  ← Shared form SVG background
    │   │   │   └── login-mascot.svg                              ← Mascot (auth pages)
    │   │   ├── header.svg
    │   │   ├── sign-up-bg.png
    │   │   ├── landing-cloud.svg
    │   │   ├── landing-iggy.svg
    │   │   ├── info-check-circle.svg
    │   │   ├── app-submitted-bg.png
    │   │   ├── app-underreview-bg.png
    │   │   └── app-accepted-bg.png
    │   ├── buttons/
    │   │   └── signup-button.png
    │   ├── icons/          ← SVG icons for portal UI
    │   │   ├── ignition-logo.svg
    │   │   ├── Article-icon.svg
    │   │   ├── clock-icon.svg
    │   │   └── check-mark-icon.svg
    │   ├── iggy.svg        ← Mascot illustration
    │   └── logo.svg        ← Ignition logo
    │
    ├── components/
    │   ├── auth/
    │   │   └── RequireRole.jsx    ← Route guard: redirects by role
    │   ├── hacker/
    │   │   ├── UserIdBadge.jsx    ← Top-right "Your User ID" badge
    │   │   └── UserIdBadge.css
    │   ├── portal/
    │   │   ├── PortalLayout.jsx   ← Shared layout wrapper (navbar + outlet)
    │   │   ├── PortalLayout.css
    │   │   ├── PortalNavBar.jsx   ← Shared navbar for reviewer/admin
    │   │   ├── PortalNavBar.css
    │   │   ├── PortalSidebar.jsx  ← Shared sidebar with filter items + children
    │   │   └── PortalSidebar.css
    │   └── shared/
    │       ├── StatusBadge.jsx    ← Unified status badge for all portals
    │       ├── StatusBadge.css
    │       ├── AvatarInitials.jsx ← Initials avatar circle
    │       ├── AvatarInitials.css
    │       ├── FilterTabs.jsx     ← Horizontal filter tab bar
    │       └── FilterTabs.css
    │
    ├── pages/
    │   ├── NotFound.jsx           ← 404 page
    │   ├── NotFound.css
    │   ├── auth/
    │   │   ├── Login.jsx          ← Login page (Login.css shared by Login/Forgot/Reset)
    │   │   ├── Login.css
    │   │   ├── Signup.jsx         ← Applicant signup page
    │   │   ├── Signup.css
    │   │   ├── ReviewerSignup.jsx ← Reviewer signup (requires secret)
    │   │   ├── AdminSignup.jsx    ← Admin signup (requires secret)
    │   │   ├── ForgotPassword.jsx ← Forgot password page (reuses Login.css)
    │   │   └── ResetPassword.jsx  ← Reset password page (reuses Login.css)
    │   └── hacker/
    │       ├── Dashboard.jsx      ← Applicant dashboard (status-aware)
    │       ├── Dashboard.css
    │       ├── Landing.jsx        ← Landing/welcome page
    │       ├── Landing.css
    │       ├── Info.jsx           ← Form step 1: personal info
    │       ├── Education.jsx      ← Form step 2: education + hackathon experience
    │       ├── Teammates.jsx      ← Form step 3: teammates by user-id lookup
    │       ├── Questions.jsx      ← Form step 4: three written responses
    │       └── FinishApp.jsx      ← Form step 5: review & submit
    │
    ├── admin/
    │   ├── AdminApp.jsx           ← Admin portal root (sidebar + page routing)
    │   ├── AdminApp.css
    │   ├── pages/
    │   │   ├── AllApplications.jsx  ← Admin application table page
    │   │   ├── AllApplications.css
    │   │   ├── AdminApplicationDetail.jsx ← Admin single-application view
    │   │   └── AdminApplicationDetail.css
    │   └── components/
    │       └── ...                ← Admin-specific sub-components
    │
    ├── hooks/
    │   └── useCachedFetch.js      ← Hook for cache-first data fetching
    │
    └── reviewer/
        ├── pages/
        │   ├── ReviewerMainPage.jsx ← Main reviewer dashboard
        │   ├── ReviewerMainPage.css
        │   ├── ReviewerApplicationDetail.jsx ← Review detail page with scoring rubric
        │   └── ReviewerApplicationDetail.css
        └── components/
            ├── ApplicationTable.jsx ← Sortable, paginated application table
            └── ApplicationTable.css
```

---

## Key Files at a Glance

| File | One-line Description |
|------|---------------------|
| `backend/src/index.js` | Production entry: connects to DB, builds the app, starts the server |
| `backend/src/app.js` | Builds and exports the Express app (no DB/listen) — shared by index.js and tests |
| `backend/src/middleware/auth.js` | Verifies JWT tokens and sets `req.user` |
| `backend/src/middleware/roles.js` | Checks `req.user.role` against allowed roles |
| `backend/src/routes/signup.js` | All auth endpoints (signup, login, password reset) |
| `backend/src/routes/applications.js` | All application and review CRUD endpoints |
| `backend/src/routes/admin.js` | Admin dashboard endpoints (stats, lists, CSV, user management) |
| `tests/` | End-to-end API tests — see [Testing](./testing.md) |
| `frontend/src/main.jsx` | React app entry point, creates browser router |
| `frontend/src/routes/routes.jsx` | All route definitions with role guards |
| `frontend/src/lib/auth.js` | Token/user storage helpers (sessionStorage) |
| `frontend/src/lib/api.js` | API URL construction helper |
| `frontend/src/lib/cache.js` | Module-level TTL cache shared across pages |
| `frontend/vite.config.js` | Vite plugins and dev server proxy configuration |
