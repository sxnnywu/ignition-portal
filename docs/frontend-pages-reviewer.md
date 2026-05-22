# Frontend Pages — Reviewer

These pages are only accessible to users with the `reviewer` or `admin` role.

## Layout Wrapper

Reviewer routes use the shared **PortalLayout** component:

**File:** `frontend/src/components/portal/PortalLayout.jsx`
**CSS:** `frontend/src/components/portal/PortalLayout.css`

It renders:
1. `PortalNavBar` — shared top navigation bar
2. `<Outlet />` — where child routes render (inside a flex row body)

The layout is wrapped with `<RequireRole allowed={['reviewer', 'admin']}>` in the route config, so all nested pages are automatically protected. Both the reviewer and admin portals share this same layout component.

### CSS Structure
```
.portal-layout          ← full viewport, flex column
  ├── PortalNavBar      ← fixed height navbar
  └── .portal-layout-body  ← flex row, fills remaining space
        └── <Outlet />  ← child route content
```

---

## ReviewerMainPage

**File:** `frontend/src/reviewer/pages/ReviewerMainPage.jsx`
**CSS:** `frontend/src/reviewer/pages/ReviewerMainPage.css`
**Route:** `/reviewer`

### Purpose
The main dashboard for reviewers. Shows all submitted applications in a filterable, searchable, sortable, paginated table.

### Layout
```
┌──────────────────────────────────────────────────┐
│  PortalNavBar                                    │
├──────────┬───────────────────────────────────────┤
│ My Queue │  Application Pool          [Search]   │
│          │                                       │
│ All (5)  │  ┌─────────────────────────────────┐  │
│ Pending  │  │  ApplicationTable               │  │
│ Reviewed │  │  (sorted, filtered, paginated)  │  │
│          │  │                                 │  │
│          │  └─────────────────────────────────┘  │
└──────────┴───────────────────────────────────────┘
```

### Data Fetching

Uses the module-level TTL cache via `useCachedFetch`:

1. Checks cache for `CACHE_KEYS.REVIEWER_APPS`
2. If stale or missing, fetches `GET /applications/reviewer` with Bearer token
3. On 401 → clears auth, redirects to login
4. On success → stores applications in cache and state
5. On error → shows error message

### Sidebar

Uses the shared `PortalSidebar` component with `title="My Queue"`. Shows three filter options with live counts:

| Filter | Shows | Count |
|--------|-------|-------|
| All Applications | All non-draft applications | Total count |
| Pending Review | Applications the reviewer hasn't reviewed yet | `reviewStatus === 'pending'` count |
| Reviewed by me | Applications the reviewer has already scored | `reviewStatus === 'reviewed'` count |

Clicking a sidebar item sets `activeFilter` state. The filtered list is computed via `useMemo` — **no additional API calls are made**. All filtering happens client-side.

### Search

The search bar filters applications by applicant name (case-insensitive substring match). Works independently of the sidebar filter — both are applied simultaneously.

### Counts

Counts are computed from the fetched data using `useMemo`:
```javascript
const counts = useMemo(() => {
  let all = 0, pending = 0, reviewed = 0
  for (const app of appList) {
    all++
    if (app.reviewStatus === 'reviewed') reviewed++
    else pending++
  }
  return { all, pending, reviewed }
}, [appList])
```

### Action Button

Each table row has a "Review" or "Update" button:
- `reviewStatus === 'pending'` → shows "Review"
- `reviewStatus === 'reviewed'` → shows "Update"

Clicking navigates to `/reviewer/application/:id` (the ReviewerApplicationDetail page).

### CSS Prefix: `rv-` (for page-level styles)

---

## ApplicationTable

**File:** `frontend/src/reviewer/components/ApplicationTable.jsx`
**CSS:** `frontend/src/reviewer/components/ApplicationTable.css`

A reusable table component for displaying applications.

### Props
| Prop | Type | Description |
|------|------|-------------|
| `applications` | Array | The filtered list of application objects |
| `rowsPerPage` | Number | How many rows per page (default: 8) |
| `onActionClick` | Function | Callback when the action button is clicked, receives the app object |

### Columns

| Column | Data Source | Style |
|--------|------------|-------|
| ID | Last 6 characters of `app._id` | Gray, monospace feel |
| Applicant | `app.userId?.name` | Bold |
| School | `app.answers?.school` | Normal |
| Submitted | `app.submittedAt` formatted as "Mon. DD" | Normal |
| Status | `app.reviewStatus` as badge | Colored badge |
| Your Score | `app.yourScore` or "—" | Bold |
| Action | "Review →" or "Update →" button | Button |

### Sorting

A dropdown in the table header allows sorting by:

| Option | Sort Logic |
|--------|-----------|
| Submitted (Newest) | `submittedAt` descending (default) |
| Submitted (Oldest) | `submittedAt` ascending |
| Status | `reviewStatus` alphabetical |
| Score (High–Low) | `yourScore` descending (unscored at bottom) |
| Score (Low–High) | `yourScore` ascending (unscored at bottom) |
| ID | `_id` alphabetical |

Changing the sort resets to page 1.

### Pagination

Appears only when total pages > 1. Shows:
- "Prev" button (disabled on page 1)
- Page number buttons with ellipsis for large page counts
- "Next" button (disabled on last page)

The pagination algorithm (`getPageNumbers`) shows:
- Always page 1 and the last page
- The current page and its neighbors
- Ellipsis (...) when there are gaps

### Status Badges

Uses the shared `StatusBadge` component. Reviewer statuses:

| Status | Background | Text Color | Label |
|--------|-----------|------------|-------|
| reviewed | `#A172FF` (purple) | `#332452` | Reviewed |
| pending | `#AEFFFF` (cyan) | `#567F7F` | Pending |

### Empty State
When no applications match the current filter + search, shows "No applications found." centered in the table.

---

## ReviewerApplicationDetail

**File:** `frontend/src/reviewer/pages/ReviewerApplicationDetail.jsx`
**CSS:** `frontend/src/reviewer/pages/ReviewerApplicationDetail.css`
**Route:** `/reviewer/application/:id`

### Purpose
The detailed review page where reviewers read an applicant's full submission and assign scores using a rubric. This page opens when a reviewer clicks "Review" or "Update" in the ApplicationTable.

### Layout
```
┌──────────────────────────────────────────────────────────────┐
│  PortalNavBar                                                │
├──────────────────────────────────────────┬───────────────────┤
│ ← Return to Pool                        │ Scoring Rubric    │
│ Application #A1B2C3 -- Bobby Brown      │                   │
│                                         │  TOTAL SCORE      │
│ ┌─────────────────────────────────┐     │     72            │
│ │ Personal Information            │     │    / 100          │
│ │ ─────────────────────────────── │     │                   │
│ │ Name: Bobby Brown               │     │ Technical Skills  │
│ │ Email: bobby@test.com           │     │ ──────○────── 20/25│
│ └─────────────────────────────────┘     │                   │
│                                         │ Communication     │
│ ┌─────────────────────────────────┐     │ ─────────○─── 22/25│
│ │ Education                       │     │                   │
│ │ ─────────────────────────────── │     │ Project Mgmt      │
│ │ School: University of Toronto   │     │ ───────○───── 18/25│
│ └─────────────────────────────────┘     │                   │
│                                         │ Problem Solving   │
│ ┌─────────────────────────────────┐     │ ──────○────── 12/25│
│ │ Hackathon Experience            │     │                   │
│ │ ─────────────────────────────── │     │ Comments          │
│ │ Attended 2025: Yes              │     │ ┌───────────────┐ │
│ │ Hackathons: 3                   │     │ │               │ │
│ └─────────────────────────────────┘     │ └───────────────┘ │
│                                         │                   │
│                                         │ [Save Review]     │
│                                         │ ← Return to Pool  │
└─────────────────────────────────────────┴───────────────────┘
```

### Two-Panel Layout

| Panel | Width | Background | Content |
|-------|-------|-----------|---------|
| Left (content) | `flex: 1` | `#FFEFDA` | Application details in white cards, scrollable |
| Right (rubric) | `340px` fixed | `#FFF8F0` | Scoring sliders and submit button, border-left `#A38C6F` |

### Data Fetching

On mount, fetches two endpoints in parallel:
1. `GET /applications/:id` — the full application (answers, userId.name, userId.email)
2. `GET /applications/:id/review/me` — the reviewer's existing review (if any)

If an existing review is found:
- Pre-fills the scoring sliders with saved scores
- Pre-fills the comment textarea
- Changes the submit button to "Update Existing Review"

### Application Content (Left Panel)

Three white cards with `border: 1px solid #A38C6F`, `border-radius: 16px`:

**Personal Information**
- Name and email from `application.userId`
- Additional fields from `application.answers`: firstName, lastName, gender, age, ethnicity, country, city, stateProvince
- Two-column grid layout

**Education**
- Fields: educationalInstitution, levelOfEducation, programName, coopStudent
- Two-column grid layout

**Hackathon Experience**
- Fields: attended2025, hackathonsAttended
- Plus any unrecognized answer keys (catch-all)
- Long text values (>120 chars) render in highlight boxes (`#FFF8F0` bg, 16px border-radius)

### Scoring Rubric (Right Panel)

Four fixed categories, each scored 0-25 via range sliders:

| Category | Key | Max Score |
|----------|-----|-----------|
| Technical Skills | `technicalSkills` | 25 |
| Communication Skills | `communicationSkills` | 25 |
| Project Management | `projectManagement` | 25 |
| Problem Solving | `problemSolving` | 25 |

- **Total Score** displayed prominently in Jua 64px, `#A172FF` (purple)
- **Sliders** have a custom purple track fill and thumb
- **Comments** textarea for free-text feedback
- **Submit button** changes based on review state:
  - No existing review → "Save Review" (brown bg `#765C3A`, white text)
  - Existing review → "Update Existing Review" (white bg, `#A38C6F` border)

### Submit Flow

```
Reviewer adjusts sliders and types comments
  ↓
Click "Save Review" or "Update Existing Review"
  ↓
POST /applications/:id/review   (new review)
  — or —
PUT  /applications/:id/review   (update existing)
  ↓
Body: { scores: { technicalSkills, communicationSkills, projectManagement, problemSolving }, comment }
  ↓
On success:
  - Updates existingReview state
  - Invalidates CACHE_KEYS.REVIEWER_APPS (so main page reflects new status)
  - Shows success message
```

### Navigation

Two "← Return to Pool" links (top of content area and bottom of rubric) both navigate back to `/reviewer`.

### CSS Prefix: `rev-` (for detail-page styles)
