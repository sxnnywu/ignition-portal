# Frontend Pages — Reviewer

These pages are only accessible to users with the `reviewer` or `admin` role.

## ReviewerLayout

**File:** `frontend/src/reviewer/layouts/ReviewerLayout.jsx`
**CSS:** `frontend/src/reviewer/layouts/ReviewerLayout.css`

A layout wrapper that renders:
1. `PortalNavBar` — shared top navigation bar
2. `<Outlet />` — where child routes render

The layout is wrapped with `<RequireRole allowed={['reviewer', 'admin']}>` in the route config, so all nested pages are automatically protected.

### CSS Structure
```
.reviewer-layout          ← full viewport, flex column
  ├── PortalNavBar        ← fixed height navbar
  └── .reviewer-layout-body  ← flex row, fills remaining space
        └── <Outlet />    ← child route content
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
│          │  Application Pool          [Search]   │
│ Sidebar  │                                       │
│          │  ┌─────────────────────────────────┐  │
│ All (5)  │  │  ApplicationTable               │  │
│ Pending  │  │  (sorted, filtered, paginated)  │  │
│ Reviewed │  │                                 │  │
│          │  └─────────────────────────────────┘  │
└──────────┴───────────────────────────────────────┘
```

### Data Fetching

On mount:
1. Checks for auth token (redirects to `/` if missing)
2. Fetches `GET /applications/reviewer` with Bearer token
3. On 401 → clears auth, redirects to login
4. On success → stores applications in state
5. On error → shows error message

### Sidebar Filtering

The sidebar shows three filter options with live counts:

| Filter | Shows | Count |
|--------|-------|-------|
| All Applications | All non-draft applications | Total count |
| Pending Review | Applications the reviewer hasn't reviewed yet | `reviewStatus === 'pending'` count |
| My Reviews | Applications the reviewer has already scored | `reviewStatus === 'reviewed'` count |

Clicking a sidebar item sets `activeFilter` state. The filtered list is computed via `useMemo` — **no additional API calls are made**. All filtering happens client-side.

### Search

The search bar filters applications by applicant name (case-insensitive substring match). Works independently of the sidebar filter — both are applied simultaneously.

### Counts

Counts are computed from the fetched data using `useMemo`:
```javascript
const counts = useMemo(() => {
  let all = 0, pending = 0, reviewed = 0
  for (const app of applications) {
    all++
    if (app.reviewStatus === 'reviewed') reviewed++
    else pending++
  }
  return { all, pending, reviewed }
}, [applications])
```

### Action Button

Each table row has a "Review" or "Update" button:
- `reviewStatus === 'pending'` → shows "Review →"
- `reviewStatus === 'reviewed'` → shows "Update →"

Currently, clicking the button only logs to console. The review detail page is not yet implemented.

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

| Status | Background | Text Color |
|--------|-----------|------------|
| Reviewed | `#A172FF` (purple) | `#332452` |
| Pending | `#AEFFFF` (cyan) | `#567F7F` |

### Empty State
When no applications match the current filter + search, shows "No applications found." centered in the table.
