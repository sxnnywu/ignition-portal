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
| `accepted` | Full-page PNG background | Invisible hit area (shows alert) |
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

## Info (Step 1 of Application)

**File:** `frontend/src/pages/hacker/Info.jsx`
**Route:** `/info`

### Purpose
First page of the multi-step application form. Collects personal information.

### Form Fields

**Basics section:**
- First name (text input)
- Last name (text input)
- Gender (select: Male, Female, Non-binary, Other, Prefer not to say)
- Age (text input)
- Ethnicity (select: Asian, Black, Hispanic/Latino, White, Indigenous, Middle Eastern, Pacific Islander, Multiracial, Other, Prefer not to say)

**Location section:**
- Country (text input)
- City (text input)
- State/Province (text input)

### Navigation
- Back button → `/` (login)
- Continue button → `/education`

### Uses: `HkFormPage` wrapper with `info.png` background

---

## Education (Step 2 of Application)

**File:** `frontend/src/pages/hacker/Education.jsx`
**Route:** `/education`

### Purpose
Second step of the application. Collects educational background.

### Form Fields

**School section:**
- Educational institution (text input)
- Level of education (select: High School, Undergraduate, Graduate, Bootcamp, Other)

**Program section:**
- Program name (text input)
- Co-op student? (select: Yes, No)

### Navigation
- Back button → `/info`
- Continue button → `/experience`

### Uses: `HkFormPage` wrapper with `education.png` background

---

## Experience (Step 3 of Application)

**File:** `frontend/src/pages/hacker/Experience.jsx`
**Route:** `/experience`

### Purpose
Third step of the application. Collects hackathon experience.

### Form Fields
- Did you attend IgnitionHacks 2025? (select: Yes, No)
- How many hackathons have you attended? (select: 0, 1, 2, 3, 4, 5 or more)

### Data Saving
Unlike Info and Education, this page **saves data to the backend** when "Continue" is clicked:
1. Gets the auth token
2. Sends `POST /applications` with `{ answers: { attended2025, hackathonsAttended }, status: "draft" }`
3. On success, navigates to `/teammates`
4. On error, shows an alert

### Navigation
- Back button → `/education`
- Continue button → saves data, then `/teammates`

### Uses: `HkFormPage` wrapper with `experience.png` background

---

## Teammates (Step 4 of Application)

**File:** `frontend/src/pages/hacker/Teammates.jsx`
**Route:** `/teammates`

### Purpose
Fourth step of the application. Collects teammate information (up to 3 teammates).

### Form Fields
Three teammate slots, each with:
- Full name (text input)
- Email address (email input)

### State Management
Uses a `teammates` state array of 3 objects: `[{ name: '', email: '' }, ...]`

The `handleTeammateChange(index, field, value)` function immutably updates a single teammate entry.

### Data Saving
On continue:
1. Gets the auth token
2. Sends `POST /applications` with `{ answers: { teammates }, status: "draft" }`
3. On success, navigates to `/info` (loops back — this may be a placeholder)
4. On error, shows an alert

### Navigation
- Back button → `/experience`
- Continue button → saves data, then `/info`

### Uses: `HkFormPage` wrapper with `teammates.png` background and `hk-form--vertical` class

---

## Submission

**File:** `frontend/src/pages/hacker/Submission.jsx`
**CSS:** `frontend/src/pages/hacker/Submission.css`
**Route:** `/submission/:id`

### Purpose
The final confirmation and submission page. Shows a "Ready to Submit?" prompt.

### URL Parameters
- `:id` — The application ID to submit

### Behavior
1. Displays the header image and a card with "Ready to Submit?" text
2. On clicking "Submit":
   - Sends `POST /applications/:id/submit` with auth token
   - On success, shows "Application Submitted" confirmation
   - On error, displays the error message
3. The back button navigates to the previous page (browser history)

### Two Views
- **Pre-submission**: Shows the submit prompt with Back and Submit buttons
- **Post-submission**: Shows "All done! APPLICATION SUBMITTED" success message

### CSS Prefix: `hk-sub-`
