# Frontend Pages — Hacker (Applicant)

These pages are only accessible to users with the `applicant` role. All are wrapped with `<RequireRole allowed={['applicant']}>`.

## Dashboard

**File:** `frontend/src/pages/hacker/Dashboard.jsx`
**CSS:** `frontend/src/pages/hacker/Dashboard.css`
**Route:** `/dashboard`

### Purpose
The main landing page for applicants after login. Shows their application status and a call-to-action.

### Data Fetching
On mount, calls `GET /applications/me` with the auth token. Handles:
- **401** → clears auth, redirects to login
- **404** → status is "none" (no application yet)
- **Success** → reads the first application's status

### Status Display

The page renders differently based on application status:

| Status | Display | CTA Button |
|--------|---------|-----------|
| `none` (no application) | Card with "Not Started" | "Start Application" → `/info` |
| `draft` | Card with "In Progress" | "Continue Application" → `/info` |
| `submitted` | Full-page PNG background | None |
| `under_review` | Full-page PNG background | None |
| `accepted` | Full-page PNG background | ⚠ Placeholder `alert()` — flagged for rework (`DEVELOPMENT-GUIDE.md` task B1) |
| `waitlisted` | Mapped to `under_review` display | None |
| `rejected` | Mapped to `under_review` display | None |

For `submitted`, `under_review`, and `accepted` statuses, the entire page is replaced with a styled background PNG image (e.g., `app-submitted-bg.png`).

### Exported Components
- `DASHBOARD_STATUS_CONFIG` — Configuration object mapping statuses to labels, images, and CTAs
- `DashboardStatusCard` — The card component for `none`/`draft` statuses
- `DashboardStatusPngView` — Full-page PNG view for post-submission statuses

### CSS Prefix: `hk-dash-`

---

## Landing

**File:** `frontend/src/pages/hacker/Landing.jsx`
**CSS:** `frontend/src/pages/hacker/Landing.css`
**Route:** `/landing`

### Purpose
A promotional/welcome page with a "Start Application" button.

### Behavior
- If already logged in, redirects to `/dashboard`
- The "Start Application" button navigates to `/info`
- Full-viewport layout with `landing.png` background

### CSS Prefix: `hk-landing-`

---

## The Application Form (Steps 1–5)

The five step pages (`/info`, `/education`, `/teammates`, `/questions`,
`/finish`) are nested routes under `ApplicationDraftProvider`
(`frontend/src/lib/applicationDraft.jsx`). The provider loads the user's draft
**once** (`GET /applications/me`), gates rendering behind a loading state, and
keeps the draft in memory so values survive navigation between steps and across
devices. Each step reads/writes the shared draft via the `useApplicationDraft`
hook; the draft is saved to the backend (`POST /applications`, structured
slices) on save and autosaved when leaving a step. The applicant's name is **not**
collected — it comes from `User.name`. Every step shows the applicant's own User ID
(their Mongo `_id`) via the `UserIdBadge` in the top-right, so they can share it
with teammates.

### Step 1 — Info (`/info`)

**File:** `frontend/src/pages/hacker/Info.jsx` → the `personal` slice.

- Basics: Gender, Age, Ethnicity
- Location: Country, City, State/Province

**Navigation:** Back → `/dashboard` | Continue → `/education`

### Step 2 — Education (`/education`)

**File:** `frontend/src/pages/hacker/Education.jsx` → the `education` and
`experience` slices, shown side by side.

- Education: Institution, Level of education (High School / Undergraduate /
  Graduate / Bootcamp / Other), Program (rendered **only** for
  undergraduate/graduate), Co-op status
- Hackathon experience: Attended IgnitionHacks 2025?, Number of hackathons
  attended (0–5)

**Navigation:** Back → `/info` | Continue → `/teammates`

### Step 3 — Teammates (`/teammates`)

**File:** `frontend/src/pages/hacker/Teammates.jsx` → the `teammates` slice
(optional, max 3).

Teammates are added by **user-id lookup**: the applicant enters a teammate's
User ID and clicks "Get", which calls `GET /applications/teammate/:userId`. The
returned name/email are displayed (and stored server-side from the looked-up
user). The max-of-3 rule is enforced on the backend as well as the UI.

**Navigation:** Back → `/education` | Continue → `/questions`

### Step 4 — Questions (`/questions`)

**File:** `frontend/src/pages/hacker/Questions.jsx` → the `responses` slice.

Three character-limited free-text questions:
- `admireDescribe` (≤100 chars), `proudProject` (≤500), `motivation` (≤500)

Character counters are shown; the limits match the schema and backend.

**Navigation:** Back → `/teammates` | Continue → `/finish`

### Step 5 — Finish (`/finish`)

**File:** `frontend/src/pages/hacker/FinishApp.jsx`.

Review-and-submit step. On submit, sends `POST /applications/:id/submit`. The
backend runs completeness validation and returns a `missing` list if any required
field is empty; the page surfaces that to the applicant. On success, the
applicant is taken to their submitted dashboard view.

**Navigation:** Back → `/questions` | Submit → `/dashboard`
