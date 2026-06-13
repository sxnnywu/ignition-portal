# Shared Components

## ApplicationDraftProvider

**File:** `frontend/src/lib/applicationDraft.jsx`
**Context/hook:** `frontend/src/lib/applicationDraftContext.js`

### Purpose
A layout-route provider that backs the whole multi-step application form. It is
mounted as the parent route of `/info`, `/education`, `/teammates`,
`/questions`, and `/finish` (see `routes.jsx`), so the five steps share one
in-memory draft.

### How It Works
- On mount it loads the user's existing application **once** (`GET
  /applications/me`) and gates rendering behind a loading state so steps never
  flash empty.
- It holds the draft (`personal`, `education`, `experience`, `teammates`,
  `responses`) in React state and exposes it through the `useApplicationDraft`
  hook, so navigating between steps keeps values without re-fetching.
- Steps persist to the backend via `POST /applications` (structured slices) on
  save, and the draft is autosaved when leaving a step — data is never lost by
  navigating away without an explicit "Save Draft".

### Draft context API

`useApplicationDraft()` (from `applicationDraftContext.js`) must be called inside
the provider and returns:

| Value | Type | Description |
|-------|------|-------------|
| `draft` | object | In-memory draft: `personal`, `education`, `experience`, `teammates[]`, `responses`. Numeric fields (`age`, `hackathonsAttended`) are held as **strings** for input friendliness; the backend coerces them. |
| `updateSlice(name, value)` | fn | Replace one slice in memory and mark the draft dirty. |
| `saveDraft()` | async fn | `POST /applications` with the whole draft (`status: 'draft'`); returns the new/updated application `_id`; clears the dirty flag. |
| `appId` | string \| null | The application's `_id` once created/loaded. |
| `status` | string | Current application status. |
| `setStatus(s)` | fn | Update the cached status locally (e.g. after submit). |

Implementation notes:
- The provider mirrors the latest draft in a `useRef` so the save helpers and the
  leave-the-flow autosave read fresh state without being recreated on every keystroke.
- Leaving the flow with unsaved edits fires a single autosave via
  `fetch(..., { keepalive: true })`, so it completes even as the page unmounts.
- The loading gate only appears when a token exists (i.e. there's a draft to fetch).
- Teammates are sent to the server as `{ userId }` only — the server re-derives
  name/email.

### Why a provider instead of per-page state
Each step page used to fetch/save independently and overwrite sibling data. The
provider makes the draft the single source of truth on the client, mirroring the
structured slices on the server, and enables cross-device persistence (the draft
is reloaded from the backend on any device).

---

## UserIdBadge

**File:** `frontend/src/components/hacker/UserIdBadge.jsx`
**CSS:** `frontend/src/components/hacker/UserIdBadge.css`

### Purpose
Shows the signed-in applicant their **User ID** (their Mongo `_id`) in the
top-right of the application form pages. The id is what teammates enter to add
each other in the Teammates step, so it needs to be easy to find and copy.

---

## PortalNavBar

**File:** `frontend/src/components/portal/PortalNavBar.jsx`
**CSS:** `frontend/src/components/portal/PortalNavBar.css`

### Purpose
Shared navigation bar for the reviewer and admin portal screens.

### Layout
```
┌────────────────────────────────────────────────────────┐
│ [Logo] IGNITION HACKS V7    [Reviewer Portal] [Admin Portal] [👤 John] │
└────────────────────────────────────────────────────────┘
```

### Behavior
- Reads the current user from sessionStorage via `getUser()`
- Extracts the first name: `user.name.split(' ')[0]`
- Determines active state from `location.pathname`
- The "Admin Portal" button only appears for users with `role === 'admin'`
- The active portal button gets a highlighted background (`#FFB44A`)

### Profile Icon
The profile icon has a circular `#FFEFDA` background with 4px padding and the icon itself is 32px.

### Styling
- Background: `#765C3A` (dark brown)
- Text: `#FFEFDA` (cream)
- Shadow: `0px 4px 4px 0px #00000040`
- Font: Jua
- Active button: `#FFB44A` (orange) background
- Portal buttons: 2px border `#A38C6F`, rounded pill shape

### CSS Prefix: `portal-navbar-`

---

## PortalSidebar

**File:** `frontend/src/components/portal/PortalSidebar.jsx`
**CSS:** `frontend/src/components/portal/PortalSidebar.css`

### Purpose
A unified sidebar component shared across both the reviewer and admin portals. Displays an optional title, a list of filter/navigation items with icons and optional counts, and optional children content (used by the admin portal for stats sections).

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | No | Optional title displayed above the nav items (e.g., "My Queue", "Admin Panel") |
| `items` | Array | Yes | List of `{ key, label, icon, count }` objects |
| `activeKey` | string | Yes | The currently selected item's key |
| `onSelect` | function | Yes | Callback when an item is clicked, receives the key |
| `children` | ReactNode | No | Optional content rendered below a divider (used for admin stats) |

### Item Shape
```javascript
{
  key: 'all',           // unique identifier
  label: 'All Applications',  // display text
  icon: ArticleIcon,    // string (SVG URL) or React element
  count: 42             // optional badge number
}
```

The `icon` prop is flexible:
- **String** (SVG URL) — rendered as an `<img>` tag (used by reviewer with SVG imports)
- **React element** — rendered inside a `<span>` wrapper (used by admin with inline SVG components)

### Layout
```
┌──────────────────────────┐
│ My Queue                 │  ← optional title
│ [📄] All Applications  42 │  ← active (dark bg)
│ [🕐] Pending Review    28 │
│ [✓]  Reviewed by me    14 │
│ ─────────────────────── │  ← optional divider (only if children)
│ {children}               │  ← optional (e.g., admin stats boxes)
└──────────────────────────┘
```

### Styling
- Width: `266px`
- Background: `#765C3A` (dark brown, matches navbar)
- Active item background: `#5D421F` (darker brown)
- Item height: `37px`, border-radius: `16px`, gap: `5px`
- Text: `#FFEFDA` (cream)
- Count badge: `#FFB44A` (orange) background, `24px` border-radius, white text
- Divider: `rgba(255, 245, 235, 0.15)`
- Font: Jua

### CSS Prefix: `portal-sidebar-`

---

## StatusBadge

**File:** `frontend/src/components/shared/StatusBadge.jsx`
**CSS:** `frontend/src/components/shared/StatusBadge.css`

### Purpose
A unified status badge component used in both the reviewer and admin portals to display application statuses with consistent colors.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `status` | string | The status key (e.g., `'accepted'`, `'pending'`, `'reviewed'`) |

### Status Colors

| Status Key | Label | Background | Text Color |
|-----------|-------|-----------|------------|
| `accepted` | Accepted | `#A9FF94` | `#487F3A` |
| `waitlisted` | Waitlisted | `#FFB44A` | `#755221` |
| `rejected` | Rejected | `#FF8B8B` | `#6C3939` |
| `under_review` | Reviewed | `#A172FF` | `#332452` |
| `submitted` | Pending | `#AEFFFF` | `#567F7F` |
| `reviewed` | Reviewed | `#A172FF` | `#332452` |
| `pending` | Pending | `#AEFFFF` | `#567F7F` |

Note: `reviewed`/`pending` are aliases for `under_review`/`submitted` — the reviewer API uses these simplified names while the admin API uses the full status names.

### Styling
- Height: `24px`, min-width: `75px`
- Border-radius: `16px` (pill shape)
- Font-size: `10px`, font-weight: `700`, uppercase
- Font: Satoshi Variable

### CSS Prefix: `status-badge-`

---

## RequireRole

**File:** `frontend/src/components/auth/RequireRole.jsx`

### Purpose
A route guard component that protects routes based on user role.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `allowed` | string[] | Array of allowed role strings |
| `children` | ReactNode | The protected content to render |

### Logic
```
1. No token? → Navigate to /login
2. No role or role not in allowed list? → Navigate to /not-found
3. All good? → Render children
```

### Usage in Routes
```jsx
// Single route
{ path: "/dashboard", element: <RequireRole allowed={['applicant']}><Dashboard /></RequireRole> }

// Layout route (protects all children)
{
  element: <RequireRole allowed={['reviewer', 'admin']}><ReviewerLayout /></RequireRole>,
  children: [{ path: "/reviewer", element: <ReviewerMainPage /> }]
}
```

---

## NotFound

**File:** `frontend/src/pages/NotFound.jsx`
**CSS:** `frontend/src/pages/NotFound.css`

### Purpose
A 404 error page displayed for unknown routes or unauthorized access attempts.

### Layout
Centered card on a `#FFEFDA` background:
```
         404
   Page Not Found
The page you're looking for
doesn't exist or you don't have
 permission to view it.

      [Go Home]
```

### "Go Home" Button Behavior
The button destination depends on the user's role:
- `reviewer` or `admin` → `/reviewer`
- `applicant` → `/dashboard`
- Not logged in → `/login`

### CSS Prefix: `notfound-`

---

## PortalLayout

**File:** `frontend/src/components/portal/PortalLayout.jsx`

The shared shell for the reviewer and admin portals. Renders `<PortalNavBar />`
then a `.portal-layout-body` containing `<Outlet />` (where the nested route
renders). It is used as the `element` of the portal layout routes — the
`RequireRole` guard wraps it, so every nested portal page is protected. Each page
renders its own `PortalSidebar` inside the body as needed.

```jsx
<div className="portal-layout">
  <PortalNavBar />
  <div className="portal-layout-body"><Outlet /></div>
</div>
```

---

## Other shared UI primitives

In `frontend/src/components/shared/` (used across the reviewer + admin portals):

| Component | File | Purpose |
|-----------|------|---------|
| `AvatarInitials` | `AvatarInitials.jsx` | Circular avatar showing a user's initials |
| `FilterTabs` | `FilterTabs.jsx` | Horizontal tab bar for filtering a list by status |
| `Pagination` | `Pagination.jsx` | Page controls for paginated tables |
| `ConfirmModal` | `ConfirmModal.jsx` | Generic confirm/cancel dialog (e.g. delete user) |
| `Icons` | `Icons.jsx` | Inline SVG icon set used by the portals |

Admin-specific: `frontend/src/admin/components/AddUserModal.jsx` — modal form to
create a user (name/email/role/password → `POST /api/admin/users`).

(These are presentational; see each file for exact props. Keep their CSS prefixes
consistent with the existing convention — [CSS Architecture](./css-architecture.md).)

---

## Data layer: caching

The reviewer/admin portals fetch through a small **module-level TTL cache** so
navigating between portal pages doesn't re-hit the API constantly.

### `lib/cache.js`

A plain `Map` at module scope (persists across component mount/unmount, not React
state). API:

| Function | Description |
|----------|-------------|
| `getCached(key)` | Returns cached data, or `null` if missing/expired (expired entries are deleted). |
| `setCache(key, data, ttlMs = 60000)` | Store with a TTL (default 60 s). |
| `invalidateCache(key)` | Drop one key; pass nothing/`null` to flush everything. |
| `invalidateCacheByPrefix(prefix)` | Drop every key starting with `prefix` (e.g. all pages of a list). |
| `CACHE_KEYS` | Canonical keys: `REVIEWER_APPS`, `ADMIN_STATS`, and parameterised `adminApps(params)` / `adminUsers(params)`. |

Call `invalidateCache*` after a mutation (e.g. changing a status, creating a user)
so the next read refetches.

### `hooks/useCachedFetch.js`

A drop-in fetch hook with cache-first behavior:

```js
const { data, loading, error, refresh } = useCachedFetch(cacheKey, fetchFn, { ttl, skip })
```

- On mount it checks `getCached(cacheKey)`; a fresh hit returns instantly (no
  loading flash, no network). Otherwise it calls `fetchFn()` and caches the result.
- `refresh()` forces a re-fetch and updates the cache.
- `skip: true` disables the automatic fetch (for conditional fetches).
- `fetchFn` doesn't need `useCallback` — the hook always calls the latest version
  via a ref.
