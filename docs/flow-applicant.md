# Application Flow — Applicant

This document walks through the complete journey of a hackathon applicant, from signup to application submission.

## 1. Account Creation

### New User Signup

```
User visits /signup
  ↓
Fills in: First Name, Last Name, Email, Password
  ↓
Frontend validates:
  - All fields present
  - Password: 8+ chars, uppercase, lowercase, number
  ↓
POST /signup { name: "First Last", email, password }
  ↓
Backend validates:
  - Name: letters and spaces only (no numbers)
  - Email: valid format, not taken
  - Password: meets strength requirements
  ↓
Backend formats name: "john doe" → "John Doe"
  ↓
Backend hashes password (bcrypt, 10 rounds)
  ↓
Backend creates User { name, email, password, role: "applicant" }
  ↓
Backend signs JWT { userId, role } (7-day expiry)
  ↓
Backend returns { token, user }
  ↓
Frontend stores token + user in sessionStorage
  ↓
Frontend redirects to /dashboard
```

### Returning User Login

```
User visits /login (or /)
  ↓
If already logged in → redirect to /dashboard
  ↓
Fills in: Email, Password
  ↓
POST /login { email, password }
  ↓
Backend finds user, verifies password
  ↓
Returns { token, user }
  ↓
Frontend stores auth, checks role:
  - applicant → /dashboard
  - reviewer/admin → /reviewer
```

## 2. Dashboard — Application Status

After login, the applicant lands on `/dashboard`.

```
GET /applications/me (with Bearer token)
  ↓
┌─────────────────────────────────────────┐
│ Status = 404 (no application)           │
│ → Shows "Not Started" card              │
│ → CTA: "Start Application" → /info     │
├─────────────────────────────────────────┤
│ Status = "draft"                        │
│ → Shows "In Progress" card              │
│ → CTA: "Continue Application" → /info  │
├─────────────────────────────────────────┤
│ Status = "submitted"                    │
│ → Shows full-page submitted background  │
│ → No action available                   │
├─────────────────────────────────────────┤
│ Status = "under_review"                 │
│ → Shows full-page under-review bg       │
│ → No action available                   │
├─────────────────────────────────────────┤
│ Status = "accepted"                     │
│ → Shows full-page accepted bg           │
│ → Hit area for future dashboard         │
├─────────────────────────────────────────┤
│ Status = "waitlisted" or "rejected"     │
│ → Mapped to "under_review" display      │
│ → User doesn't know they're rejected    │
└─────────────────────────────────────────┘
```

## 3. Multi-Step Application Form

The application form is a 5-step wizard. All steps are nested under
`ApplicationDraftProvider`, which loads the user's draft **once** (`GET
/applications/me`) and keeps it in memory, so data survives navigation between
steps and across devices:

```
/info → /education → /teammates → /questions → /finish
```

The applicant's first/last name are **not** collected here — they come from the
`User.name` set at signup. Every step writes into the shared draft, which is
persisted to the backend via `POST /applications` (structured slices). The draft
is also autosaved when leaving a step, so nothing is lost without an explicit
"Save Draft" click.

### Step 1: Info (/info)

Personal info → the `personal` slice:
- Basics: Gender, Age, Ethnicity
- Location: Country, City, State/Province

**Navigation:** Back → `/dashboard` | Continue → `/education`

### Step 2: Education (/education)

Education + hackathon experience side by side → the `education` and `experience`
slices:
- Education: Institution, Level of education, Program (shown only for
  undergraduate/graduate), Co-op status
- Experience: Attended IgnitionHacks 2025?, Number of hackathons attended (0–5)

**Navigation:** Back → `/info` | Continue → `/teammates`

### Step 3: Teammates (/teammates)

Optional teammates (max 3) → the `teammates` slice. Teammates are added by
**user-id lookup** (`GET /applications/teammate/:userId`) and a "Get" button;
their name/email are derived server-side from the looked-up user, never typed in.

**Navigation:** Back → `/education` | Continue → `/questions`

### Step 4: Questions (/questions)

Exactly three written responses → the `responses` slice, each character-capped:
- `admireDescribe` (≤100), `proudProject` (≤500), `motivation` (≤500)

**Navigation:** Back → `/teammates` | Continue → `/finish`

### Step 5: Finish (/finish)

Review-and-submit step. Sends `POST /applications/:id/submit`, which runs
server-side completeness validation before accepting.

**Data persistence (every step):** `POST /applications` with any subset of the
structured slices:
```json
{
  "personal":   { "gender": "female", "age": 20, "country": "Canada", "city": "Toronto", "state": "Ontario", "ethnicity": "..." },
  "education":  { "institution": "UofT", "level": "undergraduate", "program": "CS", "coop": "yes" },
  "experience": { "attended2025": "no", "hackathonsAttended": 2 },
  "teammates":  ["<userId1>"],
  "responses":  { "admireDescribe": "...", "proudProject": "...", "motivation": "..." },
  "status": "draft"
}
```
This creates a new application (201) or updates the existing one (200).

## 4. Application Submission

```
User reaches /finish
  ↓
Reviews their answers, clicks "Submit"
  ↓
POST /applications/:id/submit (with Bearer token)
  ↓
Backend validates:
  - Application exists & current user owns it
  - Status is "draft"
  - Every required field is filled (getMissingFields) — else 400 with a `missing` list
  ↓
Backend sets status = "submitted", submittedAt = now
  ↓
Frontend shows the submitted view
  ↓
User can return to /dashboard to see submitted status
```

## 5. Post-Submission

After submission, the applicant can only view their status on the dashboard. They cannot edit their application (the backend prevents reverting from `submitted` to `draft`).

The status progresses as reviewers and admins process it:
```
submitted → under_review → accepted / waitlisted / rejected
```

The applicant sees different full-page backgrounds for each status (except waitlisted/rejected, which show as "under_review" to avoid discouraging applicants before final decisions).

## Data Flow Diagram

```
Signup/Login
    │
    ▼
Dashboard (GET /applications/me)
    │
    ├── No application → "Start Application"
    │
    ▼
/info → /education → /teammates → /questions → /finish
    │                                              │
    │   (shared draft, POST /applications          │
    │    persists each step's slices)              │
    │                                              ▼
    │                            POST /applications/:id/submit
    │                                              │
    ▼                                              ▼
            Dashboard (shows "submitted" status)
```

## Important Notes

1. **Every step persists** — all five steps write into one shared draft
   (`ApplicationDraftProvider`) that is saved to the backend; the draft is also
   autosaved on leave, so navigating away does not lose data.
2. **Structured slices, not a blob** — each `POST /applications` updates only the
   slices it includes (`personal`, `education`, …); it does not wipe the others.
3. **Validation is enforced on submit** — drafts may be partial, but
   `/finish` → `POST /applications/:id/submit` rejects incomplete applications
   with a list of missing fields. The frontend also validates per field.
4. **No file upload yet** — the File model exists in the backend but there's no upload UI or endpoint.
