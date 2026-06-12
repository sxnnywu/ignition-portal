# CSS Architecture

## Overview

The project primarily uses **plain CSS** with a strict class naming convention. Tailwind CSS 4 is imported (`@import "tailwindcss"` in `index.css`) but is mostly unused — the design relies on custom CSS files co-located with their components.

## Naming Convention

Every CSS class uses a **prefix** based on its component group to prevent collisions:

| Prefix | Scope | Example Classes |
|--------|-------|----------------|
| `login-` | Login, Forgot & Reset password (shared `Login.css`) | `login-card`, `login-input`, `login-mascot`, `login-submit-btn` |
| `signup-` | Signup pages | `signup-card`, `signup-input`, `signup-mascot`, `signup-stage` |
| `hp-` | Hacker application form (shared step layout: SVG bg + cream content sheet) | `hp-page`, `hp-stage`, `hp-card` |
| `hk-dash-` | Hacker dashboard | `hk-dash-card`, `hk-dash-title`, `hk-dash-cta-btn` |
| `hk-landing-` | Hacker landing page | `hk-landing-content`, `hk-landing-bg`, `hk-landing-start-btn` |
| `rv-` | Reviewer main page & table | `rv-main-page`, `rv-table`, `rv-pagination-btn` |
| `rev-` | Reviewer application detail page | `rev-detail`, `rev-card`, `rev-rubric`, `rev-slider`, `rev-field` |
| `admin-` | Admin portal pages | `admin-app`, `admin-main`, `admin-stats-group` |
| `portal-` | Shared portal components | `portal-navbar`, `portal-navbar-btn`, `portal-sidebar-item` |
| `status-badge-` | Shared status badges | `status-badge`, `status-badge--accepted`, `status-badge--pending` |
| `notfound-` | 404 page | `notfound-page`, `notfound-code`, `notfound-btn` |

## Fonts

### Jua (BM Jua)
- **Source:** Google Fonts
- **Usage:** Headings, buttons, navigation, branding, sidebar labels
- **Loaded via:** `@import` in the HTML or CSS (assumed to be in `index.html`)

### Satoshi Variable
- **Source:** Fontshare
- **Usage:** Body text, table content, pagination, error messages
- **Family string:** `'Satoshi Variable', 'Satoshi', sans-serif`

### System Fonts (Fallback)
- `system-ui, Avenir, Helvetica, Arial, sans-serif` — set on `:root` in `index.css`

## Color Palette

### Primary Browns
| Color | Hex | Usage |
|-------|-----|-------|
| Dark Brown | `#765C3A` | Navbar bg, sidebar bg, primary buttons, 404 code |
| Darker Brown | `#5D421F` | Active sidebar item, button hover |
| Medium Brown | `#A38C6F` | Borders, inactive button borders |

### Backgrounds
| Color | Hex | Usage |
|-------|-----|-------|
| Cream | `#FFEFDA` | Main content area, profile icon circle, 404 page |
| Light Cream | `#FFF8F0` | Table header row, action button bg |
| White | `#FFFFFF` | Cards, table body, search input |
| Lightest Cream | `#FFFAF5` | Table row hover |

### Accents
| Color | Hex | Usage |
|-------|-----|-------|
| Orange | `#FFB44A` | Active portal button, sidebar count badges, waitlisted badge bg |
| Purple | `#A172FF` | Reviewed status badge bg, scoring rubric total score, slider fill |
| Cyan | `#AEFFFF` | Pending status badge bg |
| Green | `#A9FF94` | Accepted status badge bg |
| Red | `#FF8B8B` | Rejected status badge bg |
| Dashboard Green | `#2bb673` | Dashboard check icon (submitted/accepted) |

### Text
| Color | Hex | Usage |
|-------|-----|-------|
| Brown | `#765C3A` | Primary headings, card titles, field labels, buttons |
| Dark | `#333` | Body text, input values |
| Black | `#000` | Field values in reviewer detail cards |
| Medium | `#555` | Secondary text, table cells |
| Light | `#666` | ID column, muted text |
| Placeholder | `#999` | Input placeholders, pagination ellipsis, max score indicators |
| Error | `#c00` | Error messages |
| Badge Purple Text | `#332452` | Reviewed badge text |
| Badge Cyan Text | `#567F7F` | Pending badge text |
| Badge Green Text | `#487F3A` | Accepted badge text |
| Badge Orange Text | `#755221` | Waitlisted badge text |
| Badge Red Text | `#6C3939` | Rejected badge text |

## Responsive Approach

### Decoupled SVG Background + Responsive Content Sheet
The hacker form pages (Info, Education, Teammates, Questions, Finish) and the auth
pages render a full-bleed SVG illustration as the background, with the cream
`#FFF9F2` sheet (`.hp-stage` / `.login-stage` etc.) as the actual content
container. Content inside scales with `clamp()` and container queries rather than
being absolutely positioned over a fixed-size raster — so the layout holds across
all viewport widths and heights instead of cropping or leaving blank gaps.

### Clamp-Based Sizing
The reviewer components use CSS `clamp()` for font sizes:
```css
font-size: clamp(0.7rem, 0.85vw, 0.85rem);
```
This provides a responsive range: minimum of `0.7rem`, scales with viewport width, maximum of `0.85rem`.

### Fixed + Flex Layout
The portal layout uses a combination:
- **Sidebar**: Fixed width (`266px`)
- **Content area**: `flex: 1` fills remaining space
- **Navbar**: Full width, fixed height
- **Reviewer detail rubric panel**: Fixed width (`340px`) right sidebar

## CSS File Organization

Each component or page has its own CSS file co-located next to its JSX file:

```
pages/
  auth/
    Login.jsx
    Login.css        ← login-specific styles
  hacker/
    Dashboard.jsx
    Dashboard.css    ← dashboard-specific styles
    portal.css       ← shared hacker form layout (.hp-page / .hp-stage / .hp-card)
components/
  hacker/
    UserIdBadge.jsx
    UserIdBadge.css  ← "Your User ID" badge
  portal/
    PortalLayout.jsx
    PortalLayout.css ← shared layout wrapper
    PortalNavBar.jsx
    PortalNavBar.css
    PortalSidebar.jsx
    PortalSidebar.css
  shared/
    StatusBadge.jsx
    StatusBadge.css  ← unified status badges
reviewer/
  components/
    ApplicationTable.jsx
    ApplicationTable.css
  pages/
    ReviewerMainPage.jsx
    ReviewerMainPage.css
    ReviewerApplicationDetail.jsx
    ReviewerApplicationDetail.css  ← two-panel detail + rubric
admin/
  AdminApp.jsx
  AdminApp.css
  pages/
    AllApplications.jsx
    AllApplications.css
    AdminApplicationDetail.jsx
    AdminApplicationDetail.css
```

## Global Styles

**File:** `frontend/src/index.css`

Minimal global styles:
- Imports Tailwind CSS 4
- Sets root font family to system fonts
- Enables font smoothing
- Resets body margin and sets `min-height: 100vh`

## Shadows

| Component | Shadow |
|-----------|--------|
| PortalNavBar | `0px 4px 4px 0px #00000040` |

## Border Radius Values

| Usage | Radius |
|-------|--------|
| Table wrapper, cards | `16px` |
| Sidebar items, filter tabs | `16px` |
| Input fields, search, textarea | `10px` |
| Rubric submit buttons | `8px` |
| Avatar initials | `8px` |
| Status badges | `16px` (pill) |
| Sidebar count badges | `24px` (pill) |
| Portal buttons | `1.5em` (pill) |
| Pagination buttons | `6px` |
| 404 "Go Home" button | `12px` |
| Profile icon | `50%` (circle) |
