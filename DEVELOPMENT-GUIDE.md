# Ignition Portal — Development Guide & Task Prompts

This is the master file for continuing work on the Ignition Portal. It is written
so that a **fresh AI session** (or a new developer) can read it top to bottom,
understand the entire project, and then execute the remaining work using the
detailed, self-contained prompts in Part 4 — with minimal back-and-forth.

> **About the forgot/reset-password feature:** it is known to be incomplete and is
> being finished by another team member. Do not work on it and do not include it
> in any task below — it is intentionally out of scope here.

---

## How to use this file

1. Read **Part 1** (project explanation) and skim the **docs map** in Part 2.
2. Read **Part 3** (ground rules) — they apply to *every* task.
3. Pick a prompt from **Part 4**, paste it to the AI, and let it work. Each prompt
   is standalone and contains the context, files, acceptance criteria, and a
   branch/test footer.

The prompts are grouped and ordered so the repo is cleaned and stabilized first,
then bugs/missing features, then tests, then quality/refactor, then deployment.

---

# Part 1 — The project, explained

## What it is

**Ignition Portal** is the web application for **Ignition Hacks V7**, a hackathon.
It serves three roles:

- **Applicant (hacker)** — signs up, fills out a multi-step application, submits it,
  and sees their status.
- **Reviewer** — sees submitted applications and scores them against a rubric, with
  a written comment.
- **Admin** — all reviewer abilities plus dashboard stats, status decisions
  (accept / waitlist / reject), CSV export, and user management.

## Tech stack

- **Backend:** Node 18+, Express 5, Mongoose 8 (MongoDB Atlas), JWT auth, bcrypt,
  nodemailer, helmet, express-rate-limit. ES modules.
- **Frontend:** React 19, React Router 7, Vite 7, custom CSS (Tailwind installed
  but mostly unused; axios/react-query/lucide installed but the code uses `fetch`).
- **Tests:** Vitest + Supertest + mongodb-memory-server (backend only, so far).

## Repository layout

```
ignition-portal/
├── backend/     Express + Mongoose API (port 8000)
│   └── src/
│       ├── app.js          createApp() — builds the app, no DB/listen (used by prod + tests)
│       ├── index.js        connectDB() then createApp().listen()
│       ├── config/db.js    connectDB() + shared mongoose export
│       ├── routes/         signup.js (auth), applications.js, admin.js
│       ├── middleware/      auth.js (JWT), roles.js (requireRole), rateLimit.js
│       └── models/          User, Application, Review (+ Question, File, ActivityLog — UNUSED)
├── frontend/    React SPA (port 5173)
│   └── src/
│       ├── routes/routes.jsx        route objects + RequireRole guards
│       ├── lib/                     api.js, auth.js, applicationDraft.jsx
│       ├── pages/                   auth/*, hacker/*
│       ├── admin/                   admin portal
│       ├── reviewer/                reviewer portal
│       └── components/              portal chrome, auth guards, shared
├── tests/       Backend test suite (Vitest)
├── docs/        Documentation (see Part 2)
└── DEVELOPMENT-GUIDE.md   ← this file
```

## Backend architecture

- `createApp()` in `backend/src/app.js` assembles middleware in order:
  **helmet → CORS (from `CORS_ORIGIN`) → JSON body parser → routes**. It has no
  DB connection and no `listen`, so the test suite imports it directly.
- `index.js` calls `connectDB()` then `createApp().listen(PORT)`.
- Routes are mounted: `applications.js` at `/applications`, `admin.js` at
  `/api/admin`, `signup.js` at `/`.
- Every protected route uses `auth` (verifies the JWT, sets `req.user`) and, when
  role-gated, `requireRole(...roles)`.
- Auth routes are rate-limited per IP (`middleware/rateLimit.js`).

## Data model

- **User** — `name`, unique `email`, `role` (`applicant`/`reviewer`/`admin`),
  bcrypt `password`, reset-token fields.
- **Application** — exactly one per user, with **structured slices** (not a
  free-form blob):
  - `personal` (gender, age, ethnicity, country, city, state)
  - `education` (institution, level, program, coop) — `program` required only for
    undergraduate/graduate
  - `experience` (attended2025, hackathonsAttended 0–5)
  - `teammates[]` — max 3, each looked up by user-id; **name/email are re-derived
    server-side**, never trusted from the client
  - `responses` — exactly 3 written answers, capped at 100/500/500 chars
  - plus `status` (draft → submitted → under_review → accepted/waitlisted/rejected)
    and `version`
- **Review** — one per `(application, reviewer)` enforced by a **unique** index:
  `scores` (map), `totalScore`, `comment`.
- `Question`, `File`, `ActivityLog` models exist but are **not wired into any
  route** — decide per task whether to use or remove them.

## Frontend architecture

- `src/routes/routes.jsx` defines route objects; role-specific routes are wrapped
  in `RequireRole` (redirects unauthenticated → `/login`, wrong-role → `/not-found`).
- `src/lib/api.js` — `apiUrl(path)` prefixes `VITE_API_BASE_URL` when set, else
  uses relative paths (Vite proxy handles dev).
- `src/lib/auth.js` — `getToken/getUser/setAuth/clearAuth` over `sessionStorage`.
- `src/lib/applicationDraft.jsx` — `ApplicationDraftProvider` loads/holds the
  application draft and autosaves; wraps the 5 application steps.
- Pages: `pages/auth/*` (Login, Signup, ForgotPassword, ResetPassword,
  AdminSignup, ReviewerSignup), `pages/hacker/*` (Dashboard, Landing, and the
  steps Info → Education → Teammates → Questions → FinishApp), `admin/*`,
  `reviewer/*`.
- CSS uses per-component class prefixes and a cream/brown palette. Auth + hacker
  pages are responsive; **admin and reviewer portals are not yet responsive**.

## Current status (what already works and is on `main`)

- Full applicant flow (signup/login + role redirect, 5-step application, draft
  autosave + cross-device load, submit-completeness validation, teammate lookup).
- Reviewer flow (pool, rubric scoring, comments that persist, update review).
- Admin flow (stats, applications list with filter/search/sort/pagination, status
  changes, CSV export, detail view with scores+comments, user management).
- Security hardening (helmet, per-IP auth rate limiting, CORS via `CORS_ORIGIN`).
- Database indexes on the hot query paths.
- Environment config audited; `.env.example` files for backend and frontend.
- Backend test suite: **130 tests** (Vitest + Supertest + mongodb-memory-server).
- Documentation set in `docs/` (kept current).

## Known broken / missing (addressed by Part 4)

- Accepted applicants hit a placeholder `alert()` instead of a real dashboard.
- No applicant emails (submission confirmation, accept/waitlist/reject).
- No application deadline/close enforcement.
- Frontend has **no** automated tests.
- Admin/reviewer portals are not mobile-responsive.
- `AdminSignup`/`ReviewerSignup` still use the old image-based design.
- `Landing.jsx` is routed at `/landing` but nothing links to it.
- `backend/node_modules` is committed to git (anti-pattern).
- Several stale git branches; `gh` CLI not installed for PR review.
- Not yet deployed.

---

# Part 2 — Documentation map

All detailed docs live in `docs/`. Point the AI at these for specifics.

| Doc | Use it for |
|-----|-----------|
| [docs/codebase-guide.md](docs/codebase-guide.md) | Fast orientation — read first |
| [docs/architecture-overview.md](docs/architecture-overview.md) | System design, tech stack, security hardening |
| [docs/getting-started.md](docs/getting-started.md) | Clone/install/configure/run locally |
| [docs/environment-variables.md](docs/environment-variables.md) | Every env var |
| [docs/authentication.md](docs/authentication.md) | Auth flow, JWT, RBAC, rate limiting |
| [docs/security.md](docs/security.md) | Consolidated security + known gaps |
| [docs/database-models.md](docs/database-models.md) | Every Mongoose model + indexes |
| [docs/api-reference.md](docs/api-reference.md) | Every endpoint |
| [docs/testing.md](docs/testing.md) | The test suite — run + coverage |
| [docs/frontend-routing.md](docs/frontend-routing.md) | Routes + guards |
| [docs/frontend-pages-auth.md](docs/frontend-pages-auth.md) | Auth pages |
| [docs/frontend-pages-hacker.md](docs/frontend-pages-hacker.md) | Hacker pages |
| [docs/frontend-pages-reviewer.md](docs/frontend-pages-reviewer.md) | Reviewer pages |
| [docs/shared-components.md](docs/shared-components.md) | Reusable components |
| [docs/css-architecture.md](docs/css-architecture.md) | CSS conventions, palette |
| [docs/flow-applicant.md](docs/flow-applicant.md) | Applicant journey |
| [docs/flow-reviewer.md](docs/flow-reviewer.md) | Reviewer journey |
| [docs/vite-proxy.md](docs/vite-proxy.md) | Dev proxy |
| [docs/project-structure.md](docs/project-structure.md) | Annotated file tree |

**Keep docs in sync:** any task that changes behavior, a model, a route, an env
var, or the structure **must** update the relevant doc(s) as part of "done."

---

# Part 3 — Ground rules (apply to every task)

1. **Read the relevant docs first** (Part 2) before changing code.
2. **Fix things that don't work** even if not explicitly listed — unless a task
   says not to. Leave the code better than you found it.
3. **Ask before assuming anything major.** If a task needs a product decision,
   copy/content, a Figma design, credentials, or a choice between materially
   different approaches, **stop and ask** — do not guess and move on. Minor,
   reversible implementation details you may decide yourself (state what you chose).
4. **One branch per task**, named as the prompt specifies. **Do not commit, push,
   or merge unless the user explicitly tells you to** — leave the work staged/ready
   and summarize it.
5. **Verify before claiming done:** backend → `cd tests && npm test` (keep all
   tests green and add tests for new behavior); frontend → `npm run lint` and
   `npm run build` in `frontend/`.
6. **Don't introduce secrets** into the repo. Use env vars + `.env.example`.
7. **Update docs** for anything user-facing or structural.
8. Forgot/reset-password is owned by someone else — don't touch it.

---

# Part 4 — Task prompts

Ordered groups: **A** repo/git hygiene → **B** fixes & features → **C** testing →
**D** code quality/refactor → **E** deployment & ops. Within reason, do A before
the rest.

## Group A — Repository & git hygiene

### A1 — Clean up git branches and review/merge open PRs
```
Ignition Portal. Clean up the git branch tree and reconcile open pull requests. Be careful and DO NOT delete or merge anything with unique unmerged work without confirming with me first.

Steps:
1. `git fetch --all --prune` to sync and drop deleted remote refs.
2. List every local and remote branch with its ahead/behind vs main:
   for each: `git rev-list --left-right --count main...<branch>`.
3. Branches that are 0-ahead of main (fully merged or empty) are safe to delete. As of this writing these LOCAL branches were 0-ahead and are deletion candidates: adam, feat/hacker-application-changes, feat/hacker-login-background, feat/review-applicant, feat/reviewer-screens, fix/admin-reviewer-integration, merge/css-backgrounds-validation, refactor/frontend-structure. Re-verify they're still 0-ahead, then delete the local ones (`git branch -d`) and, only if I confirm, the matching remote ones (`git push origin --delete <name>`).
4. Branches with unique commits must be reviewed, NOT auto-deleted. `background-continute-validation` was ~2 ahead of main — inspect its commits (`git log main..background-continute-validation`), summarize what they contain, and tell me whether they look already-superseded or worth keeping/merging. Do the same for any remote-only branches that are ahead of main (e.g. anish, aryan, sunny, youssef, screen-4-5, admin-reviewer-*, copilot/sub-pr-14). Do NOT merge any of them without my go-ahead.
5. Pull requests: the `gh` CLI is NOT installed in this environment. Either install/authenticate it (`gh auth login`) or ask me to paste the open-PR list. For each open PR, summarize what it changes, whether it conflicts with current main, and a recommendation (merge / close / needs work). Only merge a PR after I approve, and merge it properly (resolve conflicts, keep main green: run the backend tests after).
6. Note: the `login-password-reset` branch is the forgot-password work owned by someone else — leave it alone.

Deliver: a short report — what you deleted, what unique-work branches/PRs exist with recommendations, and what you merged (only after my approval). Do not commit/push/merge until I say so for each non-trivial action.
Branch: not needed (git maintenance). 
```

### A2 — Stop committing `backend/node_modules`
```
Ignition Portal. backend/node_modules is currently tracked in git (~1835 files) — an anti-pattern that bloats the repo and causes spurious diffs (frontend/ and tests/ correctly ignore theirs). Untrack it.

Do:
1. Confirm it's tracked: `git ls-files backend/node_modules | head`.
2. Ensure backend/.gitignore ignores node_modules (add `node_modules/` if missing; keep the existing `!.env.example` negation).
3. Remove it from the index WITHOUT deleting it from disk: `git rm -r --cached backend/node_modules`.
4. Verify `git status` now shows the deletions staged and that `node backend/src/index.js` still resolves modules locally (they remain on disk).
5. Confirm a fresh `npm install` in backend/ reproduces it (package.json + package-lock.json are the source of truth — they already list helmet and express-rate-limit).
6. Update docs/getting-started.md / docs/project-structure.md if they imply node_modules is committed.

Acceptance: backend/node_modules is no longer tracked, backend still runs, tests still pass (cd tests && npm test). This is a large staged deletion — leave it for me to review and commit; do not commit/push yourself.
Branch: chore/untrack-backend-node-modules.
```

## Group B — Fixes & missing features

### B1 — Replace the broken accepted-hacker dashboard
```
Ignition Portal (React 19 + Vite). Accepted applicants currently hit a broken placeholder — frontend/src/pages/hacker/Dashboard.jsx around line 42 does onClick: () => window.alert('Hacker dashboard coming soon'). Replace it with a real, simple post-acceptance view.

Read first: frontend/src/pages/hacker/Dashboard.jsx (how it branches on application.status across draft/submitted/under_review/accepted/waitlisted/rejected and what each renders), its CSS, and docs/frontend-pages-hacker.md.

Do:
- For status === 'accepted': render a confirmation panel (heading like "You're in!", a short congrats message, and a "next steps" placeholder e.g. "We'll email event details soon"). Use the existing design system (Jua/Satoshi fonts, cream #fff9f2 / purple #a172ff / brown palette) and match the responsiveness of the other hacker pages.
- Remove the window.alert and any now-dead handler.
- Ensure submitted/under_review still show "received / under review" and that waitlisted/rejected render a clean, honest, non-broken state.

ASK ME before assuming: the exact copy for the accepted / waitlisted / rejected panels (I will provide). Don't invent final wording for these — use clearly-marked placeholders if I haven't answered yet.

Acceptance: every status renders an on-brand, non-broken panel with no alert(); `npm run lint` + `npm run build` clean. Update docs/frontend-pages-hacker.md.
Branch: feat/accepted-dashboard.
```

### B2 — Applicant emails: submission confirmation + decision notifications
```
Ignition Portal backend (Express + Mongoose). nodemailer is already used in backend/src/routes/signup.js via getEmailTransporter() (EMAIL_SERVICE / EMAIL_USER / EMAIL_PASSWORD). Add the applicant-facing emails. Reuse the existing transporter — don't build a new one. (The forgot-password email path is owned by someone else; only touch the shared mailer extraction, not that route's behavior.)

1. Refactor: extract the transporter + a sendMail({ to, subject, html }) helper into backend/src/lib/mailer.js; have signup.js import it (behavior unchanged).
2. Submission confirmation: in POST /applications/:id/submit (backend/src/routes/applications.js), after status becomes 'submitted' and the doc saves, look up the applicant (User.findById(application.userId)) and email a confirmation.
3. Decision notifications: in POST /applications/:id/status (admin route), when status changes to accepted / waitlisted / rejected, email the applicant the matching message. Do NOT email for under_review or other transitions.

Requirements:
- Sending must be NON-FATAL: try/catch, log on failure, still return the normal 200. If EMAIL_USER/EMAIL_PASSWORD are unset, skip sending (so local dev + tests don't break).
- Tests (tests/, Vitest+Supertest): stub backend/src/lib/mailer.js's sendMail so no real email is sent; assert it's called once with the applicant's address on submit and on each of the three decisions, and NOT called for under_review. Keep all existing tests green.

ASK ME before assuming: the exact subject + body copy for the confirmation and for accepted / waitlisted / rejected. Note: relies on EMAIL_* env vars being set in deployment. Update docs/api-reference.md (note the side-effect emails) and docs/flow-applicant.md / flow-reviewer.md as relevant.
Branch: feat/applicant-emails.
```

### B3 — Application open/close deadline
```
Ignition Portal. Add a hard application deadline enforced server-side and reflected in the UI.

ASK ME FIRST (required, don't assume): is there a deadline, the exact close date/time + timezone, and confirm config via env var APPLICATION_DEADLINE (ISO-8601). If I say there's no deadline, stop and do nothing.

Backend (backend/src/routes/applications.js):
- In POST /applications/:id/submit, if now > APPLICATION_DEADLINE, return 403 ("Applications are closed.") before marking submitted. Keep draft saves (POST /applications) allowed after close unless I say otherwise.
- If APPLICATION_DEADLINE is unset, behave exactly as today (no deadline) so dev/tests are unaffected.

Frontend (frontend/src/pages/hacker/FinishApp.jsx and/or Dashboard.jsx): show a closed state and disable submit past the deadline. Use the simplest source for the date (a VITE_ var, or expose it via an endpoint — ask me if a new endpoint is needed).

Add APPLICATION_DEADLINE to backend/.env.example + docs/environment-variables.md. Tests: cover submit just-before (allowed) and just-after (403) by injecting the env var. Keep tests green.
Branch: feat/application-deadline.
```

### B4 — Resume / file upload (decision-gated)
```
Ignition Portal. Decide and (if wanted) implement resume/file upload.

ASK ME FIRST (required): is a resume/file upload needed at all? If NO — do nothing except confirm, and (optionally) note the decision in docs. If YES, get from me: which step it belongs in, required vs optional, allowed types + max size, and the storage backend (S3 or Cloudinary) with how credentials are provided.

If YES, implement: a field on backend/src/models/Application.js (and/or use the existing unused backend/src/models/File.js), an upload endpoint with auth + ownership + type/size validation (re-derive metadata server-side, never trust the client), and a frontend upload control in the chosen step. Make the file viewable to reviewers/admins in the detail views. Add tests for the endpoint (auth + validation). Update docs/database-models.md + docs/api-reference.md.

Do not assume storage choices or limits — wait for my answers.
Branch: feat/resume-upload (or chore/document-no-upload if NO).
```

### B5 — Teammate flow integrity (decision-gated)
```
Ignition Portal. Decide and enforce the intended teammate rules. Today (backend/src/routes/applications.js, buildTeammates + GET /applications/teammate/:userId): teammates are capped at 3, self/duplicates/non-applicants are rejected, and name/email are re-derived server-side. A user-id can currently appear on multiple teams, and teammates aren't notified/confirmed.

ASK ME FIRST (required): (a) are shared teammates across different teams allowed? (b) should adding a teammate require mutual confirmation? (c) any cap on how many teams may list one person?

Implement whatever I choose (e.g. reject a user-id already on another application's teammates, or an invite/confirm model) in buildTeammates and the lookup route. Add tests for the new rule (allow + reject). Update docs/flow-applicant.md.

Do not change the rules without my decision.
Branch: feat/teammate-integrity.
```

### B6 — Landing page: keep or remove (decision-gated)
```
Ignition Portal. frontend/src/pages/hacker/Landing.jsx is routed at /landing in frontend/src/routes/routes.jsx but nothing links to it.

ASK ME FIRST: keep it (and add a sensible link/entry point) or remove it entirely?

If REMOVE: delete Landing.jsx + its CSS, remove the import + route from routes.jsx, and delete any assets only it used (verify references first). Update docs/frontend-routing.md + docs/project-structure.md. If KEEP: wire a link to it and document its purpose.

`npm run lint` + `npm run build` must stay clean. No dead imports/assets left.
Branch: chore/landing-decision.
```

### B7 — Restyle AdminSignup / ReviewerSignup
```
delete adminsignup and reviewersignup and any routes that lead to them because they are not needed anymore
```

## Group C — Testing & debugging

### C1 — Frontend test harness
```
Ignition Portal frontend (React 19 + Vite). There are no frontend tests yet (backend has a full Vitest suite in tests/). Stand up the frontend harness.

Add devDeps + config for Vitest + @testing-library/react + @testing-library/jest-dom + jsdom in frontend/. Add a `test` script. Add ONE smoke test against a pure piece of logic (e.g. the ApplicationDraftProvider in src/lib/applicationDraft.jsx, or a validation helper) to prove it runs. Don't disturb the existing eslint/build config. Document how to run it in docs/testing.md (add a "Frontend tests" section).

Acceptance: `npm run test` works in frontend/ with ≥1 passing test; lint + build still clean.
Branch: test/frontend-harness.
```

### C2 — Frontend tests: applicant journey
```
Ignition Portal. Using the frontend Vitest + React Testing Library harness (set up C1 first if absent), write numbered component/integration tests for the applicant experience. Mock network with a fetch stub. (Backend applicant behavior is already covered in tests/.)

Cover: signup/login client validation + role-based redirect; the 5-step flow (Info → Education/Experience → Teammates → Questions → Finish); char limits (100/500/500) with counters; program shown/required only for undergraduate/graduate; teammate-lookup states (valid / not-found / self / duplicate / max-3); draft autosave + reload; submit blocked until complete. Assert on rendered output and on request payloads sent.

Acceptance: suite passes via frontend `npm run test`; lint + build clean.
Branch: test/frontend-applicant.
```

### C3 — Frontend tests: reviewer & admin
```
Ignition Portal. With the frontend harness (C1), write numbered tests for reviewer + admin UIs. Mock all network with a fetch stub; assert rendered output and request payloads. (Backend is covered in tests/.)

Reviewer: pool/list rendering, rubric scoring + comment box, save vs update review, pre-fill of an existing review incl. its comment. Admin: stats cards, applications table (filter/search/sort/pagination), quick status change, CSV export trigger, detail view (scores + comments), user management (create/role/delete) UI states.

Acceptance: suite passes; lint + build clean.
Branch: test/frontend-reviewer-admin.
```

### C4 — Full end-to-end QA pass + fix blockers
```
Ignition Portal. Run a full QA sweep against a live local stack (backend + frontend + a throwaway DB) and FIX any blocking bug you find (smallest correct change; don't add features).

Verify and report pass/fail for each journey:
1. Applicant: signup → login → Info → Education/Experience → Teammates (valid/not-found/self/duplicate/4th-rejected) → Questions (char limits) → submit. Confirm draft persists + reloads on fresh login; submit blocked until complete; program required only for undergrad/grad.
2. Reviewer: login → see submitted apps → open one → score rubric → add comment → save → reload → confirm comment + scores persist → update review.
3. Admin: login → stats → applications (filter/search/sort/pagination) → detail (scores + comments) → change status accepted/waitlisted/rejected → CSV export → user management (create/role/delete cascade).
4. Cross-cutting: role redirects; applicant blocked from reviewer/admin routes; accepted dashboard renders (no alert — depends on B1); 429 after rapid logins; helmet headers present.

Keep the 130 backend tests green; re-verify after each fix. Deliver a checklist of what passed and what you fixed. If you find something that needs a product decision to fix correctly, ASK rather than guessing.
Branch: chore/prelaunch-qa.
```

## Group D — Code quality, security & refactoring

### D1 — Backend cleanup & consistency refactor
```
Ignition Portal backend. Improve quality without changing behavior (keep all 130 tests green throughout; add tests if you tighten behavior).

Do:
- Introduce a small consistent logger (replace scattered console.error) that doesn't leak internals to clients; keep error responses as { message }.
- Audit for dead/unused code. The models Question.js, File.js, ActivityLog.js are not wired into any route — ASK ME whether to remove them or keep for planned features; don't delete unilaterally.
- Ensure consistent response shapes and status codes across routes (compare against docs/api-reference.md; fix mismatches in code or docs).
- Factor obvious duplication in routes (e.g. repeated id-validation / not-found handling) into small helpers where it improves clarity. Don't over-engineer.
- Confirm input validation is consistent and server-authoritative everywhere.

Update docs for any change. Acceptance: cleaner code, tests green, behavior identical (or tightened with tests + my OK).
Branch: refactor/backend-cleanup.
```

### D2 — Frontend cleanup & consistency refactor
```
Ignition Portal frontend. Improve quality without changing UX (lint + build must stay clean; if C1 is done, keep frontend tests green).

Do:
- Remove dead code and unused imports/assets. Audit installed-but-unused deps (axios, @tanstack/react-query, lucide-react, tailwind) — report which are truly unused and ASK before removing any dependency.
- Standardize data-fetching: consistent loading / empty / error states on every page that fetches; replace any raw alert()/silent catch with consistent in-UI messaging.
- Factor repeated fetch + auth-header + error handling into a small shared helper building on src/lib/api.js, without changing behavior.
- Keep the CSS prefix conventions (docs/css-architecture.md).

Update docs as needed. Acceptance: no dead code/imports, consistent states, lint + build clean.
Branch: refactor/frontend-cleanup.
```

### D3 — Admin & reviewer portal responsiveness
```
Ignition Portal. The admin and reviewer portals have NO @media queries and aren't mobile-friendly (only auth + hacker pages got responsive work). Make them usable from ~360px up without changing behavior.

Files: frontend/src/admin/** (AdminApp, AllApplications, AdminApplicationDetail), frontend/src/reviewer/** (main page, application table, ApplicationDetail), and shared frontend/src/components/portal/** (layout, navbar, sidebar). Handle: sidebar collapsing on narrow widths, the reviewer detail's fixed rubric panel stacking under content, tables becoming horizontally scrollable or card-style, and the navbar. Keep the existing design system + class prefixes.

Acceptance: no overflow/overlap from ~360px up; lint + build clean. Add a brief note to docs/css-architecture.md.
Branch: feat/portal-responsive.
```

### D4 — Accessibility pass
```
Ignition Portal. Improve accessibility across auth, hacker, reviewer, and admin UIs without redesigning.

Do: associate every input with a <label> (htmlFor/id) or aria-label; meaningful alt text (empty alt for decorative mascots); visible focus states + logical tab order; ensure custom controls (e.g. the reviewer rubric slider/buttons) are keyboard-operable with appropriate aria roles/values; check WCAG AA contrast on the cream/brown palette and fix failures (note any palette changes for my approval BEFORE shipping visible color changes).

Acceptance: forms labelled, keyboard-usable, no obvious AA contrast failures; lint + build clean. Summarize changes.
Branch: feat/a11y-pass.
```

### D5 — Production security finalization
```
Ignition Portal. Finalize security for production (most hardening is already in: helmet, per-IP auth rate limiting, CORS via CORS_ORIGIN, JWT, bcrypt, unique review index). See docs/security.md "Known gaps".

Do:
- Add app.set('trust proxy', …) in backend/src/app.js, guarded so it only applies in production / behind a proxy (so local + tests are unaffected) — required for the rate limiter to see real client IPs. Confirm express-rate-limit doesn't throw its permissive-trust-proxy validation.
- Verify CORS_ORIGIN handling forces a real origin in prod (no wildcard) and document the exact value to set.
- Decide (ASK ME) whether to move the rate-limit store to a shared store (e.g. Redis) — only needed if running multiple backend instances; otherwise document the in-memory limitation.
- Re-check that no secrets are committed and no debug endpoints exist.

Update docs/security.md. Keep tests green.
Branch: chore/security-finalize.
```

## Group E — Deployment & ops

### E1 — Production deployment + first-admin bootstrap
```
Ignition Portal monorepo (frontend = Vite build; backend = Node/Express; DB = MongoDB Atlas). Produce a complete, reproducible deployment and document it.

ASK ME FIRST (required): target hosts (e.g. frontend on Vercel/Netlify, backend on Render/Railway/Fly), domain(s), and whether to commit platform config files.

Do:
1. Backend: build/start (npm start → node src/index.js), Node version, and the FULL env var list (cross-check backend/.env.example): MONGO_URI, JWT_SECRET, CORS_ORIGIN, PORT, REVIEWER_SIGNUP_SECRET, ADMIN_SIGNUP_SECRET, EMAIL_SERVICE/USER/PASSWORD, FRONTEND_URL (+ APPLICATION_DEADLINE if B3 done).
2. Lock CORS_ORIGIN to the real frontend origin (never * in prod); verify backend/src/app.js.
3. Set trust proxy (coordinate with D5) so rate limiting works behind the host proxy.
4. Frontend: vite build; set VITE_API_BASE_URL to the backend's public URL (see frontend/src/lib/api.js + frontend/.env.example). HTTPS on both.
5. First admin/reviewer bootstrap: document creating them via POST /signup/admin and /signup/reviewer with ADMIN_SIGNUP_SECRET / REVIEWER_SIGNUP_SECRET (example requests); strong secrets, rotate post-launch.
6. Write docs/deployment.md (step-by-step). Add platform config files only if I approved committing them.

No real secrets in the repo. Run backend tests + a frontend build after wiring. Deliver a reproducible path to a live stack.
Branch: chore/deployment.
```

### E2 — Backups & monitoring
```
Ignition Portal. Document/enable backups and basic monitoring.

ASK ME FIRST: which tooling — Atlas built-in backups, an uptime pinger, and/or an error tracker (e.g. Sentry)?

Do: document enabling MongoDB Atlas backups (retention + restore steps). If I want Sentry/equivalent, add minimal backend + frontend integration behind env vars that is a no-op when unset; otherwise document a basic uptime/error-monitoring plan. Write docs/operations.md.

Acceptance: a clear ops doc; any integration is env-gated and verified to be a no-op when disabled (tests stay green).
Branch: chore/backups-monitoring.
```

---

## Suggested execution order

1. **A1, A2** — clean the repo and branches first.
2. **B1** (accepted dashboard) and **B2** (emails) — the most visible gaps.
3. **B3–B7** — decision-gated; ask, then build.
4. **C1 → C2 → C3 → C4** — frontend tests, then a full QA pass.
5. **D1–D5** — quality, responsiveness, a11y, security finalize.
6. **E1, E2** — deploy and ops.

When everything in Groups A–D is green and a QA pass (C4) is clean, the product is
ready for the E1 deployment.

---

# Appendix A — Commands cheat sheet

```bash
# Backend (port 8000)
cd backend && npm install && npm run dev      # dev (nodemon)
cd backend && npm start                        # production-style

# Frontend (port 5173)
cd frontend && npm install && npm run dev      # dev (HMR)
cd frontend && npm run lint && npm run build   # the frontend "done" gate
BACKEND_URL=http://localhost:9000 npm run dev  # dev proxy → non-default backend port

# Backend tests (in-memory Mongo; the backend "done" gate)
cd tests && npm install && npm test
cd tests && npm run test:watch

# Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
openssl rand -hex 32

# Seed accounts (dev)
curl -X POST localhost:8000/signup -H 'Content-Type: application/json' \
  -d '{"name":"A B","email":"a@b.com","password":"Password123"}'
curl -X POST localhost:8000/signup/admin -H 'Content-Type: application/json' \
  -d '{"name":"Ad Min","email":"admin@b.com","password":"Password123","secret":"<ADMIN_SIGNUP_SECRET>"}'

# Git branch hygiene (task A1)
git fetch --all --prune
git rev-list --left-right --count main...<branch>   # behind<->ahead
git branch -d <merged-branch>                        # delete a merged local branch
```

The **definition of done** for any change: backend → `cd tests && npm test` green
(plus new tests for new behavior); frontend → `npm run lint` and `npm run build`
clean; docs updated for anything user-facing or structural.

# Appendix B — Gotchas & conventions

- Env var is **`MONGO_URI`** (not `MONGODB_URI`); the DB name must be in the URI.
- Frontend `RequireRole` is **UX-only** — the backend `auth`/`requireRole` is the
  real boundary. Never rely on the client guard for protection.
- **Drafts may be partial**; required-field validation runs only on submit
  (`getMissingFields`). `program` is required only for undergraduate/graduate.
- `hackathonsAttended: 0` is valid (≠ `null`). Draft numbers are strings on the
  client; the server coerces them.
- The server is authoritative: it **re-derives** teammate name/email, **recomputes**
  review `totalScore`, and re-validates every field. Don't trust client values.
- The review rubric keys live in the **frontend** (`scores` is a `Map`); changing
  them needs no schema migration.
- Auth routes are **rate-limited** (`429`); tests set `DISABLE_RATE_LIMIT=true`.
  In production set `app.set('trust proxy', …)` so the limiter sees real IPs.
- `backend/node_modules` is **committed** (anti-pattern → task A2).
- `Question` / `File` / `ActivityLog` models are **unused** (→ task D1).
- ES modules backend (`"type": "module"`); `createApp()` (no DB/listen) is shared
  by `index.js` and the tests.

# Appendix C — Glossary

- **slice** — a structured Application section (`personal`, `education`,
  `experience`, `teammates`, `responses`).
- **draft** — an Application with `status: 'draft'`.
- **review pool** — submitted/under_review applications shown to reviewers.
- **rubric** — the four 0–25 reviewer scoring categories.
- **layout route** — a parent route rendering `<Outlet/>` (`PortalLayout`,
  `ApplicationDraftProvider`).
- **slice-independent save** — `POST /applications` only overwrites the slices
  present in the body; other slices are left intact.
