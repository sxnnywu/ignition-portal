# Frontend Routing & Guards

## Router Setup

The app uses **React Router DOM v7** with the `createBrowserRouter` API.

**File:** `frontend/src/main.jsx`

```jsx
const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
```

The route configuration is defined in `frontend/src/routes/routes.jsx`.

## Route Table

| Path | Component | Access | Guard |
|------|-----------|--------|-------|
| `/` | Login | Public | — |
| `/login` | Login | Public | — |
| `/signup` | Signup | Public | — |
| `/forgot-password` | ForgotPassword | Public | — |
| `/reset-password` | ResetPassword | Public | — |
| `/landing` | Landing | Applicant only | `RequireRole(['applicant'])` |
| `/dashboard` | Dashboard | Applicant only | `RequireRole(['applicant'])` |
| `/info` | Info | Applicant only | `RequireRole(['applicant'])` |
| `/education` | Education | Applicant only | `RequireRole(['applicant'])` |
| `/experience` | Experience | Applicant only | `RequireRole(['applicant'])` |
| `/teammates` | Teammates | Applicant only | `RequireRole(['applicant'])` |
| `/submission/:id` | Submission | Applicant only | `RequireRole(['applicant'])` |
| `/reviewer` | ReviewerMainPage | Reviewer/Admin | `RequireRole(['reviewer', 'admin'])` (on layout) |
| `/not-found` | NotFound | Public | — |
| `*` (catch-all) | NotFound | Public | — |

## RequireRole Guard

**File:** `frontend/src/components/auth/RequireRole.jsx`

This component wraps protected routes and enforces access control:

```jsx
<RequireRole allowed={['applicant']}>
  <Dashboard />
</RequireRole>
```

**Decision flow:**
1. No token in sessionStorage → `<Navigate to="/login" />`
2. User's role is not in the `allowed` array → `<Navigate to="/not-found" />`
3. Role matches → render children

## Reviewer Route Nesting

The reviewer route uses a **layout route** pattern:

```jsx
{
  element: (
    <RequireRole allowed={['reviewer', 'admin']}>
      <ReviewerLayout />
    </RequireRole>
  ),
  children: [
    { path: "/reviewer", element: <ReviewerMainPage /> },
  ],
}
```

`ReviewerLayout` renders:
1. `PortalNavBar` — the top navigation bar
2. `<Outlet />` — where child routes render (currently just `ReviewerMainPage`)

The `RequireRole` guard wraps the entire layout, so all nested routes are protected.

## Login Redirect Logic

When a user logs in or visits the login page while already authenticated, the redirect depends on their role:

| Role | Redirects to |
|------|-------------|
| `applicant` | `/dashboard` |
| `reviewer` | `/reviewer` |
| `admin` | `/reviewer` |

This logic lives in `Login.jsx` in two places:
1. **`useEffect`** — checks on page load if already logged in
2. **`handleLogin`** — redirects after successful login

## 404 Page

**File:** `frontend/src/pages/NotFound.jsx`

Shown when:
- A user navigates to a path that doesn't exist
- A user tries to access a route their role doesn't allow
- Directly visiting `/not-found`

The page displays a "404 - Page Not Found" message with a "Go Home" button. The button is role-aware:
- Reviewers/Admins → goes to `/reviewer`
- Applicants → goes to `/dashboard`
- Not logged in → goes to `/login`

## Navigation Flow Summary

```
Not logged in:
  Any URL → /login (via RequireRole redirect)
  
Applicant logged in:
  /reviewer → /not-found (wrong role)
  /dashboard → Dashboard (allowed)
  
Reviewer logged in:
  /dashboard → /not-found (wrong role)
  /reviewer → ReviewerMainPage (allowed)
  
Unknown URL:
  /anything-random → NotFound page (catch-all)
```
