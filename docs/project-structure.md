# Project Structure

## Root

```
ignition-portal/
├── backend/               ← Express.js REST API
├── frontend/              ← React 19 SPA (Vite)
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
    ├── index.js           ← Server entry point: Express app setup, DB connect, route mounting
    ├── config/
    │   └── db.js          ← MongoDB connection using Mongoose
    ├── middleware/
    │   ├── auth.js        ← JWT token verification middleware (sets req.user)
    │   └── roles.js       ← Role-based access control middleware (requireRole)
    ├── models/
    │   ├── User.js        ← User schema: name, email, password, role, reset token
    │   ├── Application.js ← Application schema: userId, status, answers, version
    │   ├── Review.js      ← Review schema: applicationId, reviewerId, scores, totalScore
    │   ├── Question.js    ← Question schema: key, label, type, order (config/testing)
    │   ├── File.js        ← File schema: applicationId, fileName, storagePath (not yet used)
    │   └── ActivityLog.js ← ActivityLog schema: actorId, action, meta (not yet used)
    └── routes/
        ├── signup.js      ← Auth routes: /signup, /signup/reviewer, /signup/admin,
        │                     /login, /forgot-password, /reset-password
        ├── applications.js ← Application & review CRUD: /applications/*
        └── test.js        ← Sandbox test endpoints for developers (not for production)
```

### Route Mounting

In `index.js`:
```
/api/test       → test.js
/applications   → applications.js
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
    │   └── api.js          ← API URL helper: apiUrl() adds optional base URL
    │
    ├── assets/
    │   ├── backgrounds/    ← Page background PNGs and SVGs
    │   │   ├── login.png
    │   │   ├── sign-up-bg.png
    │   │   ├── reset.png
    │   │   ├── landing.png
    │   │   ├── info.png
    │   │   ├── education.png
    │   │   ├── experience.png
    │   │   ├── teammates.png
    │   │   ├── header.svg
    │   │   ├── app-submitted-bg.png
    │   │   ├── app-underreview-bg.png
    │   │   └── app-accepted-bg.png
    │   ├── buttons/        ← Button image assets
    │   │   ├── login-button.png
    │   │   ├── signup-button.png
    │   │   ├── login-back-button.png
    │   │   ├── recover-button.png
    │   │   ├── start-application.png
    │   │   ├── back.png
    │   │   ├── back-button.svg
    │   │   ├── continue.png
    │   │   └── submit-button.svg
    │   ├── icons/          ← SVG icons for portal UI
    │   │   ├── ignition-logo.svg
    │   │   ├── profile-icon.svg
    │   │   ├── Article-icon.svg
    │   │   ├── clock-icon.svg
    │   │   └── check-mark-icon.svg
    │   └── iggy.svg        ← Mascot illustration
    │
    ├── components/
    │   ├── auth/
    │   │   └── RequireRole.jsx    ← Route guard: redirects by role
    │   ├── hacker/
    │   │   ├── HkFormPage.jsx     ← Shared form page layout wrapper
    │   │   └── HkFormPage.css
    │   └── portal/
    │       ├── PortalNavBar.jsx   ← Shared navbar for reviewer/admin
    │       ├── PortalNavBar.css
    │       ├── PortalSidebar.jsx  ← Shared sidebar with filter items
    │       └── PortalSidebar.css
    │
    ├── pages/
    │   ├── NotFound.jsx           ← 404 page
    │   ├── NotFound.css
    │   ├── auth/
    │   │   ├── Login.jsx          ← Login page
    │   │   ├── Login.css
    │   │   ├── Signup.jsx         ← Signup page
    │   │   ├── Signup.css
    │   │   ├── ForgotPassword.jsx ← Forgot password page
    │   │   ├── ForgotPassword.css
    │   │   └── ResetPassword.jsx  ← Reset password page (reuses ForgotPassword.css)
    │   └── hacker/
    │       ├── Dashboard.jsx      ← Applicant dashboard (status-aware)
    │       ├── Dashboard.css
    │       ├── Landing.jsx        ← Landing/welcome page
    │       ├── Landing.css
    │       ├── Info.jsx           ← Form step 1: personal info
    │       ├── Education.jsx      ← Form step 2: education
    │       ├── Experience.jsx     ← Form step 3: hackathon experience
    │       ├── Teammates.jsx      ← Form step 4: teammate info
    │       ├── Submission.jsx     ← Application submission page
    │       └── Submission.css
    │
    └── reviewer/
        ├── layouts/
        │   ├── ReviewerLayout.jsx ← Wraps navbar + outlet for reviewer routes
        │   └── ReviewerLayout.css
        ├── pages/
        │   ├── ReviewerMainPage.jsx ← Main reviewer dashboard
        │   └── ReviewerMainPage.css
        └── components/
            ├── ApplicationTable.jsx ← Sortable, paginated application table
            └── ApplicationTable.css
```

---

## Key Files at a Glance

| File | One-line Description |
|------|---------------------|
| `backend/src/index.js` | Creates Express app, connects to DB, mounts all routes |
| `backend/src/middleware/auth.js` | Verifies JWT tokens and sets `req.user` |
| `backend/src/middleware/roles.js` | Checks `req.user.role` against allowed roles |
| `backend/src/routes/signup.js` | All auth endpoints (signup, login, password reset) |
| `backend/src/routes/applications.js` | All application and review CRUD endpoints |
| `frontend/src/main.jsx` | React app entry point, creates browser router |
| `frontend/src/routes/routes.jsx` | All route definitions with role guards |
| `frontend/src/lib/auth.js` | Token/user storage helpers (sessionStorage) |
| `frontend/src/lib/api.js` | API URL construction helper |
| `frontend/vite.config.js` | Vite plugins and dev server proxy configuration |
