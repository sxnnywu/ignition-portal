# Application Flow — Reviewer

This document walks through the complete journey of a reviewer, from account creation to reviewing applications.

## 1. Account Creation

Reviewer accounts cannot be created through the standard signup UI. They require a secret passphrase.

```
POST /signup/reviewer
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Password123",
  "secret": "reviewer_signup_secret_change_this"
}
```

The secret must match the `REVIEWER_SIGNUP_SECRET` environment variable. This ensures only authorized people can create reviewer accounts.

The same name validation and formatting applies: no numbers allowed, auto-capitalized.

## 2. Login & Redirect

```
Reviewer visits /login
  ↓
Enters email and password
  ↓
POST /login → returns { token, user: { role: "reviewer" } }
  ↓
Frontend stores auth in sessionStorage
  ↓
Frontend checks user.role === "reviewer"
  ↓
Redirects to /reviewer (NOT /dashboard)
```

If a reviewer tries to access applicant pages (`/dashboard`, `/info`, etc.), the `RequireRole` guard redirects them to `/not-found`.

## 3. Reviewer Portal Layout

The reviewer portal is a two-part layout:

```
┌──────────────────────────────────────────────────┐
│  PortalNavBar                                    │
│  [Logo] IGNITION HACKS V7  [Reviewer Portal] [👤 Jane] │
├──────────┬───────────────────────────────────────┤
│          │                                       │
│ Sidebar  │  Main Content (ReviewerMainPage)      │
│          │                                       │
└──────────┴───────────────────────────────────────┘
```

- **PortalNavBar** — Shows logo, brand, portal buttons, and user's first name
- **PortalSidebar** — Filter options with live counts
- **Main content** — Application table with search, sort, and pagination

## 4. Loading Applications

On page load:

```
Check sessionStorage for token
  ↓ (no token → redirect to /login)
  
GET /applications/reviewer (with Bearer token)
  ↓
Backend:
  1. Verify JWT → extract userId and role
  2. Check role is "reviewer" or "admin"
  3. Find all non-draft applications
  4. Find all reviews by this reviewer
  5. Build a map: applicationId → review
  6. For each application, add:
     - reviewStatus: "reviewed" or "pending"
     - yourScore: totalScore or null
     - reviewId: review._id or null
  ↓
Frontend receives array of application objects
  ↓
Computes counts: all, pending, reviewed
  ↓
Renders sidebar with counts and table with data
```

## 5. Filtering Applications

The sidebar provides three filters. **All filtering happens client-side** — no additional API calls.

### All Applications
Shows every non-draft application regardless of whether the reviewer has reviewed it.

### Pending Review
Shows only applications where `reviewStatus === 'pending'` — i.e., the current reviewer has NOT yet submitted a review.

### My Reviews
Shows only applications where `reviewStatus === 'reviewed'` — i.e., the current reviewer HAS submitted a review.

### Search
The search bar filters by applicant name (case-insensitive substring match). Search works in combination with the sidebar filter.

**Example:** If "Pending Review" is active and the search query is "john", only pending applications from applicants whose names contain "john" are shown.

## 6. Sorting Applications

The table header has a sort dropdown with these options:

| Option | Behavior |
|--------|----------|
| Submitted (Newest) | Most recently submitted first (default) |
| Submitted (Oldest) | Oldest submissions first |
| Status | Alphabetical by reviewStatus ("pending" before "reviewed") |
| Score (High–Low) | Highest scores first, unscored at bottom |
| Score (Low–High) | Lowest scores first, unscored at bottom |
| ID | Alphabetical by application ID |

Changing the sort option resets the page to 1.

## 7. Pagination

The table shows 8 rows per page. If there are more than 8 applications matching the current filter + search, pagination controls appear:

```
← Prev  1  2  ...  5  6  7  Next →
```

The pagination algorithm:
- Always shows page 1 and the last page
- Shows the current page and its immediate neighbors
- Uses "..." for gaps
- Prev/Next buttons are disabled at the boundaries

## 8. Reviewing an Application

Clicking "Review" on a pending application navigates to `/reviewer/application/:id`.

### Page Layout

The detail page has a two-panel layout:
- **Left panel** (scrollable): Application content in three cards (Personal Information, Education, Hackathon Experience)
- **Right panel** (fixed 340px): Scoring rubric with sliders, comments, and submit button

### Data Loading

On mount, two requests fire in parallel:
```
GET /applications/:id          → application details (answers, user info)
GET /applications/:id/review/me → existing review (if any, otherwise 404)
```

If an existing review is found, the sliders and comments are pre-filled with saved values.

### Scoring Rubric

Four fixed scoring categories, each 0-25 via range sliders:

| Category | Score Key | Max |
|----------|-----------|-----|
| Technical Skills | `technicalSkills` | 25 |
| Communication Skills | `communicationSkills` | 25 |
| Project Management | `projectManagement` | 25 |
| Problem Solving | `problemSolving` | 25 |

The total score (0-100) updates live as sliders are adjusted.

### Submitting a New Review

```
Reviewer adjusts scoring sliders (0-25 each)
  ↓
Optionally adds comments in the textarea
  ↓
Clicks "Save Review"
  ↓
POST /applications/:id/review
{
  "scores": { "technicalSkills": 20, "communicationSkills": 22, "projectManagement": 18, "problemSolving": 12 },
  "comment": "Strong technical background..."
}
  ↓
Backend:
  1. Validates application is "submitted" or "under_review"
  2. Checks reviewer hasn't already reviewed (409 if duplicate)
  3. Computes totalScore = sum of all scores
  4. Creates Review document
  5. Updates application status to "under_review" if it was "submitted"
  ↓
Returns { review: { _id, scores, totalScore, ... } }
  ↓
Frontend:
  - Updates existingReview state (button changes to "Update Existing Review")
  - Invalidates CACHE_KEYS.REVIEWER_APPS so the main page reflects new status
  - Shows success message
```

### Updating an Existing Review

```
Click "Update" on a reviewed application in the table
  ↓
Navigate to /reviewer/application/:id
  ↓
Existing review loaded: sliders and comments pre-filled
  ↓
Reviewer adjusts scores and/or comments
  ↓
Clicks "Update Existing Review"
  ↓
PUT /applications/:id/review
{
  "scores": { "technicalSkills": 22, "communicationSkills": 23, "projectManagement": 20, "problemSolving": 15 },
  "comment": "Updated assessment..."
}
  ↓
Backend recomputes totalScore and updates the review
```

### Navigation Back

Two "← Return to Pool" links (top of content area and bottom of rubric) navigate back to `/reviewer`.

## 9. What Reviewers Cannot Do

- **Cannot access applicant pages** — `/dashboard`, `/info`, etc. redirect to 404
- **Cannot see all reviews** — `GET /applications/:id/reviews` is admin-only
- **Cannot change application status** — `POST /applications/:id/status` is admin-only
- **Cannot review an application twice** — returns 409 Conflict
- **Cannot review draft applications** — only `submitted` and `under_review` apps are eligible

## Data Flow Diagram

```
Login (POST /login)
    │
    ▼
/reviewer (GET /applications/reviewer)
    │
    ├── Sidebar filter (client-side)
    ├── Search (client-side)
    ├── Sort (client-side)
    └── Pagination (client-side)
    │
    ▼
Click "Review" or "Update"
    │
    ▼
/reviewer/application/:id
    │
    ├── GET /applications/:id          ← load application details
    ├── GET /applications/:id/review/me ← load existing review (if any)
    │
    ▼
Reviewer scores with sliders + adds comments
    │
    ▼
POST /applications/:id/review    ← new review
  — or —
PUT  /applications/:id/review    ← update existing
    │
    ▼
Invalidate REVIEWER_APPS cache → return to /reviewer
```

## Admin Differences

Admins see the same reviewer portal but have additional capabilities:
- The "Admin Portal" button appears in the navbar (not yet implemented)
- Can access `GET /applications` (all applications)
- Can access `POST /applications/:id/status` (change status)
- Can access `GET /applications/:id/reviews` (see all reviews)
