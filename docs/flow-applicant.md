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

The application form is a 4-step wizard:

```
/info → /education → /experience → /teammates
```

### Step 1: Info (/info)

Collects personal information:
- Basics: First name, Last name, Gender, Age, Ethnicity
- Location: Country, City, State/Province

**Navigation:** Back → `/` (login) | Continue → `/education`

**Data persistence:** Currently does NOT save to backend. Form data is lost on navigation.

### Step 2: Education (/education)

Collects educational background:
- School: Institution name, Level of education
- Program: Program name, Co-op student status

**Navigation:** Back → `/info` | Continue → `/experience`

**Data persistence:** Currently does NOT save to backend.

### Step 3: Experience (/experience)

Collects hackathon experience:
- Attended IgnitionHacks 2025?
- Number of hackathons attended

**Navigation:** Back → `/education` | Continue → `/teammates`

**Data persistence:** YES — on continue, sends `POST /applications`:
```json
{
  "answers": {
    "attended2025": "yes",
    "hackathonsAttended": "3"
  },
  "status": "draft"
}
```

This either creates a new application (201) or updates the existing one (200).

### Step 4: Teammates (/teammates)

Collects teammate information (up to 3):
- Teammate 1: Full name, Email
- Teammate 2: Full name, Email
- Teammate 3: Full name, Email

**Navigation:** Back → `/experience` | Continue → `/info`

**Data persistence:** YES — on continue, sends `POST /applications`:
```json
{
  "answers": {
    "teammates": [
      { "name": "Alice", "email": "alice@example.com" },
      { "name": "", "email": "" },
      { "name": "", "email": "" }
    ]
  },
  "status": "draft"
}
```

**Note:** Continue currently navigates back to `/info`. The submission flow requires navigating to `/submission/:id` manually or through a future implementation.

## 4. Application Submission

```
User navigates to /submission/:applicationId
  ↓
Shows "Ready to Submit?" confirmation
  ↓
User clicks "Submit"
  ↓
POST /applications/:id/submit (with Bearer token)
  ↓
Backend validates:
  - Application exists
  - Current user owns it
  - Status is "draft"
  ↓
Backend sets status = "submitted", submittedAt = now
  ↓
Frontend shows "APPLICATION SUBMITTED" success view
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
    │                          │
    ▼                          ▼
/info ←──────────────── /teammates
    │                          ▲
    ▼                          │
/education                     │
    │                          │
    ▼                          │
/experience ──────────────────→┘
    │
    │  POST /applications (saves answers)
    ▼
/submission/:id
    │
    │  POST /applications/:id/submit
    ▼
Dashboard (shows "submitted" status)
```

## Important Notes

1. **Info and Education pages don't save data** — they have form fields but no save logic. Only Experience and Teammates POST to the backend.
2. **The answers object is overwritten, not merged** — each POST replaces the entire `answers` field. This means saving teammates overwrites any experience data.
3. **No form validation on steps** — fields are not required in the frontend forms. Users can skip fields and still proceed.
4. **No file upload yet** — the File model exists in the backend but there's no upload UI or endpoint.
