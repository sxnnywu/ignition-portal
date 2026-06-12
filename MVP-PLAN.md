# Ignition Portal — MVP Launch Plan

_Last updated: 2026-06-12_

This is the plan to ship a proper MVP — the minimum needed for a working,
launchable product, nothing gold-plated. It contains:

1. **What's already done** (on `main`)
2. **The MVP prompt set** — 5 detailed, paste-ready prompts that close the real gaps
3. **Post-MVP backlog** — deliberately deferred polish

> **Excluded:** the forgot/reset-password fix and its auth testing — owned by someone else.

---

## 1. Done & on `main`

These are complete, verified, and merged:

- **Applicant flow** — signup/login with role redirect; 5-step application
  (info → education/experience → teammates → questions → finish); draft autosave +
  cross-device load; submit blocked until all required fields are valid; program
  required only for undergraduate/graduate; teammate lookup by user-id (valid /
  not-found / self / duplicate / max-3).
- **Reviewer flow** — application pool, scoring rubric, comments (persist on
  reload), update review.
- **Admin flow** — stats, All Applications (filter/search/sort/pagination), status
  changes, CSV export, application detail (scores + comments), user management
  (create / change role / delete-with-cascade).
- **Reviewer comment persistence** — model field + routes + admin display.
- **Security hardening** — `helmet` security headers; per-IP rate limiting
  (`express-rate-limit`) on `/login`, `/signup`, `/signup/reviewer`,
  `/signup/admin`, `/forgot-password`; CORS driven by `CORS_ORIGIN`.
- **Database indexes** — `Application { userId }` and `{ status, submittedAt }`;
  `Review { reviewerId }` and a unique `{ applicationId, reviewerId }`.
- **Env config audit** — corrected `backend/.env.example` (`MONGO_URI`),
  added `frontend/.env.example` (`VITE_API_BASE_URL`), gitignore negation,
  prod CORS guidance in docs.
- **Backend test suite** — `tests/` (Vitest + Supertest + mongodb-memory-server),
  **130 tests**: auth, applications, teammates, submit validation, reviews,
  admin, RBAC/JWT security, password-reset flow, rate limiting, schema-level
  model validation. Backend made testable via a `createApp()` factory.
- **Docs cleanup** — `docs/` rewritten to match current code; `docs/testing.md` added.
- **Auth UI** — enlarged the "IGNITION HACKS" card title, the "Join us for
  Ignition Hacks V7!" subtitle, and the whole form below it (inputs, links,
  error text, submit button) on login + signup.

**Standard footer for every prompt below:** create the named branch, run
`cd tests && npm test` (backend) and a `frontend` build/lint, and stop for review
before pushing.

---

## 2. MVP prompt set

Paste one at a time. Suggested order: MVP-1 → MVP-2 → MVP-3 (only if you have a
deadline) → MVP-4 → MVP-5 (right before launch).

### MVP-1 — Fix the accepted-hacker dashboard (replaces a broken `alert`)

```
Ignition Portal (React 19 + Vite frontend, Express + Mongoose backend). Accepted applicants currently hit a broken placeholder: frontend/src/pages/hacker/Dashboard.jsx line ~42 does onClick: () => window.alert('Hacker dashboard coming soon'). Replace this with a real, simple "you're accepted" view — MVP scope, no new backend.

Context to read first: frontend/src/pages/hacker/Dashboard.jsx (how it branches on application.status: draft/submitted/under_review/accepted/waitlisted/rejected and what each state currently renders), plus the existing dashboard CSS and the cream/brown design tokens used on the other hacker pages.

Do:
- For status === 'accepted', render a confirmation panel INSTEAD of firing the alert: a heading ("You're in!"), a short congratulatory message, and a placeholder for next steps (e.g. "We'll email you event details soon."). Use the existing design system (fonts Jua/Satoshi, cream #fff9f2 / purple #a172ff / brown palette) and keep it responsive like the other hacker pages.
- Remove the window.alert entirely and any now-dead onClick.
- Make sure submitted/under_review still show the "application received / under review" state, and that waitlisted/rejected render a sensible, non-broken state (a short neutral message). If the current code masks waitlisted/rejected as something else, surface a simple honest message instead — confirm the exact copy with me if unsure.
- No console errors; keyboard-focusable if interactive.

Decision to state when you start (or I'll answer): exact copy for the accepted panel and for waitlisted/rejected.

Done when: each application status renders a clean, on-brand panel with no alert(); frontend `npm run build` and `npm run lint` are clean.
Branch: feat/accepted-dashboard. Stop before pushing.
```

### MVP-2 — Applicant emails: submission confirmation + decision notifications

```
Ignition Portal backend (Express + Mongoose, nodemailer already used in backend/src/routes/signup.js via getEmailTransporter() reading EMAIL_SERVICE / EMAIL_USER / EMAIL_PASSWORD). Add the two applicant-facing emails an MVP needs. Reuse the EXISTING nodemailer transporter setup — do not build a new one.

Refactor first: extract the transporter + a sendMail helper out of signup.js into backend/src/lib/mailer.js (export e.g. sendMail({ to, subject, html })). Update signup.js to import it so there's one mail module. Keep behavior identical.

Then add:
1. Submission confirmation — in POST /applications/:id/submit (backend/src/routes/applications.js), after status flips to 'submitted' and the doc is saved, look up the applicant (User.findById(application.userId)) and email them a confirmation (their name, that the application was received).
2. Decision notifications — in POST /applications/:id/status (admin route in the same file), when status changes to 'accepted', 'waitlisted', or 'rejected', email the applicant the corresponding message.

Requirements:
- Email sending MUST be non-fatal: wrap in try/catch, log on failure, and still return the normal 200 response. If EMAIL_USER/EMAIL_PASSWORD are unset, skip sending (don't crash) — this keeps local dev and the test suite working.
- Don't send on every status (e.g. under_review shouldn't email); only the three decisions + the submit confirmation.
- Tests (tests/ folder, Vitest + Supertest): mock/stub backend/src/lib/mailer.js's sendMail so NO real email is sent, and assert it's called once with the applicant's address on (a) submit and (b) each of accepted/waitlisted/rejected, and NOT called for under_review. Keep all 130 existing tests green.

Decision to state when you start (or I'll answer): exact subject + body copy for the confirmation and for accepted / waitlisted / rejected. Note: this relies on the EMAIL_* env vars being configured in the deploy environment (same ones used elsewhere in signup.js).

Done when: emails fire on submit and on the three decisions, failures don't break the API, and tests cover it with a stubbed mailer.
Branch: feat/applicant-emails. Stop before pushing.
```

### MVP-3 — Application open/close deadline _(include only if you have a deadline; otherwise skip)_

```
Ignition Portal. Add a hard application deadline enforced server-side and reflected in the UI. MVP scope.

State up front (required): the exact close date/time + timezone, and confirm the config method — an env var APPLICATION_DEADLINE as an ISO-8601 timestamp (recommended) read in the backend.

Backend (backend/src/routes/applications.js):
- In POST /applications/:id/submit, if Date.now() is past APPLICATION_DEADLINE, reject with 403 and a clear message ("Applications are closed.") BEFORE marking submitted. Leave draft saves (POST /applications) allowed after close (so people can still edit), unless I say otherwise.
- If APPLICATION_DEADLINE is unset, behave exactly as today (no deadline) so dev/tests are unaffected.

Frontend (frontend/src/pages/hacker/FinishApp.jsx and/or Dashboard.jsx):
- When past the deadline, show a "closed" state and disable the submit button with a short message. Read the deadline via a VITE_ env var or a value exposed by an existing endpoint — pick the simplest; confirm with me if it needs a new endpoint.

Docs + env: add APPLICATION_DEADLINE to backend/.env.example and docs/environment-variables.md.

Tests (tests/): cover submit just-before (allowed) and just-after (403) by injecting APPLICATION_DEADLINE in the test. Keep existing tests green.

Done when: late submits are blocked server-side, the UI shows closed state, and tests cover both sides of the deadline.
Branch: feat/application-deadline. Stop before pushing.
```

### MVP-4 — Production deployment + first-admin bootstrap (the launch step)

```
Ignition Portal monorepo (frontend = Vite/React build; backend = Node/Express; DB = MongoDB Atlas). Produce a complete, reproducible production deployment and document it. This is the step that makes the MVP live.

State up front (required): target hosts (e.g. frontend on Vercel/Netlify, backend on Render/Railway/Fly), the domain(s), and whether I want platform config files committed.

Do:
1. Backend deploy config: build/start commands (npm start runs node src/index.js), Node version, and the FULL env var list it needs — cross-check backend/.env.example: MONGO_URI, JWT_SECRET, CORS_ORIGIN, PORT, REVIEWER_SIGNUP_SECRET, ADMIN_SIGNUP_SECRET, EMAIL_SERVICE/USER/PASSWORD, FRONTEND_URL (+ APPLICATION_DEADLINE if MVP-3 was done).
2. CORS lock: set CORS_ORIGIN to the real deployed frontend origin only (never * in prod). Verify backend/src/app.js uses it.
3. Reverse-proxy correctness: the new rate limiter is keyed by client IP, and behind a host proxy req.ip will be wrong unless trust proxy is set. Add app.set('trust proxy', 1) (or the host-appropriate value) in backend/src/app.js, guarded so it doesn't break local/test (e.g. only when behind a proxy / NODE_ENV==='production'). Confirm express-rate-limit doesn't throw its permissive-trust-proxy validation.
4. Frontend deploy: vite build, and set VITE_API_BASE_URL to the backend's public URL (see frontend/src/lib/api.js + frontend/.env.example). HTTPS on both.
5. First-admin / reviewer bootstrap: document that privileged accounts are created via POST /signup/admin and POST /signup/reviewer using ADMIN_SIGNUP_SECRET / REVIEWER_SIGNUP_SECRET (with example requests), and that those secrets must be strong and rotated post-launch.
6. Write docs/deployment.md with step-by-step instructions, and add platform config files (render.yaml / vercel.json / etc.) only if I approved committing them.

Do NOT put real secrets in the repo. After wiring, run the backend tests (cd tests && npm test) and a frontend build to confirm nothing broke.

Done when: there's a documented, reproducible path to a live frontend + backend + Atlas with locked CORS, correct client IPs, and a way to create the first admin.
Branch: chore/deployment. Stop before pushing.
```

### MVP-5 — Final pre-launch QA pass (end-to-end smoke test of the real flows)

```
Ignition Portal. Do a final pre-launch QA sweep of the whole product against a running stack (backend + frontend + a test database) and fix any small blocking bugs you find. MVP scope — fix blockers, don't add features.

Walk and verify these real journeys, noting pass/fail for each:
1. Applicant: signup → login → fill Step 1 info → Step 2 education/experience → Step 3 teammates (add by user-id: valid, not-found, self, duplicate, 4th rejected) → Step 4 questions (char limits 100/500/500) → submit. Confirm: save-draft persists and reloads on a fresh login (cross-device); submit is blocked until all required fields are filled; program is required only for undergraduate/graduate.
2. Reviewer: login → see submitted applications → open one → score the rubric → add a comment → save → reload and confirm the comment + scores persist → update the review.
3. Admin: login → stats load → All Applications (filter/search/sort/pagination) → open detail (reviewer scores + comments visible) → change status to accepted/waitlisted/rejected → CSV export downloads → user management (create, change role, delete cascades).
4. Cross-cutting: role redirects after login; an applicant cannot reach reviewer/admin routes; the accepted dashboard renders (no alert); rate limiting returns 429 after many rapid logins; helmet headers present.

For each failure, fix the smallest change that makes it correct (frontend or backend), keep the 130 backend tests green, and re-verify. Produce a short checklist report of what passed and what you fixed.

Done when: all four journeys work end-to-end with no blocking bugs, tests pass, and frontend builds.
Branch: chore/prelaunch-qa. Stop before pushing.
```

---

## 3. Post-MVP backlog (deferred polish)

Deliberately **not** part of the MVP — ship first, do these later:

- **Frontend test suite** — Vitest + React Testing Library for the applicant,
  reviewer, and admin UIs (backend is already fully tested).
- **Admin & reviewer portal responsiveness** — those portals have no `@media`
  queries yet (only auth + hacker pages got responsive work).
- **Accessibility pass** — labels/aria on inputs, alt text, keyboard nav/focus,
  contrast on the cream/brown palette.
- **Error handling / logging / empty states** — consistent backend logger,
  audit loading/empty/error states, remove stray `alert()`/silent failures.
- **Resume / file upload** — only if required (needs storage: S3/Cloudinary).
- **Teammate flow integrity** — shared-teammate rule / mutual confirmation.
- **Restyle `AdminSignup` / `ReviewerSignup`** — still use the old image-based
  design, inconsistent with the rebuilt auth pages.
- **Landing page** — `frontend/src/pages/hacker/Landing.jsx` is routed at
  `/landing` but nothing links to it; keep+link or remove.
- **Backups & monitoring** — Atlas backups + uptime/error monitoring.
- **`node_modules` hygiene** — `backend/node_modules` is committed (~1835 files);
  consider untracking it and relying on `npm install` (frontend already does).
