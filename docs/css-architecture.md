# CSS Architecture

## Overview

The project primarily uses **plain CSS** with a strict class naming convention. Tailwind CSS 4 is imported (`@import "tailwindcss"` in `index.css`) but is mostly unused — the design relies on custom CSS files co-located with their components.

## Naming Convention

Every CSS class uses a **prefix** based on its component group to prevent collisions:

| Prefix | Scope | Example Classes |
|--------|-------|----------------|
| `auth-login-` | Login page | `auth-login-form`, `auth-login-input`, `auth-login-error` |
| `auth-signup-` | Signup page | `auth-signup-card`, `auth-signup-input`, `auth-signup-error` |
| `auth-forgot-` | Forgot/Reset password | `auth-forgot-form`, `auth-forgot-input`, `auth-forgot-back-button` |
| `hk-` | Shared hacker form elements | `hk-page`, `hk-form`, `hk-input`, `hk-select`, `hk-back-btn` |
| `hk-dash-` | Hacker dashboard | `hk-dash-card`, `hk-dash-title`, `hk-dash-cta-btn` |
| `hk-landing-` | Hacker landing page | `hk-landing-content`, `hk-landing-bg`, `hk-landing-start-btn` |
| `hk-sub-` | Hacker submission page | `hk-sub-card`, `hk-sub-title`, `hk-sub-submit-btn` |
| `rv-` | Reviewer-specific components | `rv-main-page`, `rv-table`, `rv-status-badge`, `rv-pagination-btn` |
| `portal-` | Shared portal components | `portal-navbar`, `portal-navbar-btn`, `portal-sidebar-item` |
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
| Orange | `#FFB44A` | Active portal button |
| Purple | `#A172FF` | "Reviewed" status badge bg |
| Cyan | `#AEFFFF` | "Pending" status badge bg |
| Green | `#2bb673` | Dashboard check icon (submitted/accepted) |

### Text
| Color | Hex | Usage |
|-------|-----|-------|
| Dark | `#333` | Primary text, headings |
| Medium | `#555` | Secondary text, table cells |
| Light | `#666` | ID column, muted text |
| Placeholder | `#999` | Input placeholders, pagination ellipsis |
| Error | `#c00` | Error messages |
| Badge Purple Text | `#332452` | "Reviewed" badge text |
| Badge Cyan Text | `#567F7F` | "Pending" badge text |

## Responsive Approach

### Container Query Units
The hacker form pages (Info, Education, Experience, Teammates) use `cqw` (container query width) units for sizing and positioning. This allows form fields to scale proportionally with the background image.

### Clamp-Based Sizing
The reviewer components use CSS `clamp()` for font sizes:
```css
font-size: clamp(0.7rem, 0.85vw, 0.85rem);
```
This provides a responsive range: minimum of `0.7rem`, scales with viewport width, maximum of `0.85rem`.

### Fixed + Flex Layout
The portal layout uses a combination:
- **Sidebar**: Fixed width (`240px`)
- **Content area**: `flex: 1` fills remaining space
- **Navbar**: Full width, fixed height

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
components/
  hacker/
    HkFormPage.jsx
    HkFormPage.css   ← shared form styles
  portal/
    PortalNavBar.jsx
    PortalNavBar.css
    PortalSidebar.jsx
    PortalSidebar.css
reviewer/
  components/
    ApplicationTable.jsx
    ApplicationTable.css
  pages/
    ReviewerMainPage.jsx
    ReviewerMainPage.css
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
| Input fields, search | `10px` |
| Buttons (general) | `8px` |
| Status badges | `16px` (pill) |
| Portal buttons | `1.5em` (pill) |
| Pagination buttons | `6px` |
| 404 "Go Home" button | `12px` |
| Profile icon | `50%` (circle) |
