# Shared Components

## HkFormPage

**File:** `frontend/src/components/hacker/HkFormPage.jsx`
**CSS:** `frontend/src/components/hacker/HkFormPage.css`

### Purpose
A reusable layout wrapper for the multi-step hacker application form pages (Info, Education, Experience, Teammates). Eliminates ~400 lines of duplicated layout CSS.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `backgroundSrc` | string | Yes | Path to the background PNG image |
| `backTo` | string | Yes | Route to navigate to when Back is clicked |
| `onContinue` | function | Yes | Callback when Continue is clicked |
| `continueDisabled` | boolean | No | Disables the Continue button (e.g., during loading) |
| `formClassName` | string | No | Additional CSS class for the form container |
| `children` | ReactNode | Yes | The form fields to render inside the overlay |

### Layout Structure
```
.hk-page                       ← full viewport container
  └── .hk-page-content         ← relative container for positioning
        ├── img.hk-page-bg     ← background PNG, fills container
        ├── .hk-form            ← absolutely positioned form overlay
        │     └── {children}    ← form fields from the page
        ├── button.hk-back-btn  ← back button (bottom-left area)
        └── button.hk-continue-btn ← continue button (bottom-right area)
```

### How It Works
The background PNG contains the visual design (labels, decorations) created in Figma. The form fields are absolutely positioned on top using container query units (`cqw`) so they align perfectly with the design at any viewport size.

### CSS Classes Available to Children

| Class | Purpose |
|-------|---------|
| `.hk-form-section` | Groups related form fields with spacing |
| `.hk-section-label` | Label text above a group of fields |
| `.hk-field-row` | Horizontal row of inputs/selects |
| `.hk-input` | Styled text input |
| `.hk-select` | Styled dropdown select |
| `.hk-form--vertical` | Optional modifier for vertical layout (used by Teammates) |

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
