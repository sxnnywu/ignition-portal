# Frontend Pages — Auth

These pages handle user authentication. They are publicly accessible (no login required).

All auth pages share one **decoupled layout**: a full-bleed SVG background with the
cream `#FFF9F2` sheet as the content container and a mascot glued to it. Everything
inside the sheet is sized in container-query units (`max(px, Xcqmin)`) so it scales
with the sheet at any viewport size or zoom — see
[CSS Architecture › Container-query sizing](./css-architecture.md#container-query-sizing-inside-the-cream-sheet).
Login / Forgot / Reset share `Login.css` (`login-` classes); Signup has its own
`Signup.css` (`signup-`). The card title ("IGNITION HACKS"), subtitle, inputs, and
button are intentionally large.

## Login

**File:** `frontend/src/pages/auth/Login.jsx`
**CSS:** `frontend/src/pages/auth/Login.css`
**Route:** `/` and `/login`

### Layout
A full-viewport page with a full-bleed **SVG background**
(`assets/backgrounds/hacker-application/...`); the cream `#FFF9F2` sheet
(`.login-stage` / `.login-card`) is the content container and a mascot stays
attached to it. Content scales responsively (`clamp()` / container queries) — no
absolutely-positioned overlay on a fixed-size raster. `Login.css` is shared by
Login, Forgot Password, and Reset Password.

### Behavior
1. On mount, checks if a token exists in sessionStorage
2. If already logged in:
   - Reviewer/Admin → redirect to `/reviewer`
   - Applicant → redirect to `/dashboard`
3. Form has two fields: Email and Password
4. On submit, sends `POST /login` with `{ email, password }`
5. On success, stores token + user via `setAuth()`, then redirects based on role
6. On error, displays the error message below the form

### Links
- "Sign up" button → navigates to `/signup`
- "Forgot Password?" button → navigates to `/forgot-password`

### CSS Prefix: `login-`

---

## Signup

**File:** `frontend/src/pages/auth/Signup.jsx`
**CSS:** `frontend/src/pages/auth/Signup.css`
**Route:** `/signup`

### Layout
Same decoupled SVG-background + cream content-sheet approach as Login, with its
own `Signup.css` (`signup-` prefix) and `signup-mascot`.

### Form Fields
- Name (text)
- Email (email)
- Password (password)

### Behavior
1. Client-side validates all fields are filled
2. Client-side checks password strength: 8+ chars, uppercase, lowercase, number
3. Sends `POST /signup` with `{ name, email, password }`
4. Backend validates the name (letters/spaces only), formats it, creates the user
5. On success, stores auth and navigates to `/dashboard`

### Links
- "Already have an account? Log in" → navigates to `/login`

### CSS Prefix: `signup-`

> There are also **ReviewerSignup** (`/signup/reviewer`) and **AdminSignup**
> (`/signup/admin`) pages with the same layout, plus a `secret` field. They post
> to `POST /signup/reviewer` / `POST /signup/admin`, which require the matching
> server-side signup secret.

---

## Forgot Password

**File:** `frontend/src/pages/auth/ForgotPassword.jsx`
**CSS:** reuses `Login.css` (`login-` classes) — there is no separate `ForgotPassword.css`
**Route:** `/forgot-password`

### Layout
Shares Login's SVG-background layout and `Login.css`. A single email input and a
recover button; a "Back to log in" link navigates to `/login`.

### Behavior
1. User enters their email
2. Sends `POST /forgot-password` with `{ email }`
3. On success, clears the email field and shows a success message
4. On error, shows the error message
5. The backend sends an email with a reset link

### CSS Prefix: `login-` (shares `Login.css`)

---

## Reset Password

**File:** `frontend/src/pages/auth/ResetPassword.jsx`
**CSS:** Reuses `Login.css` (shares `login-` classes)
**Route:** `/reset-password`

### Layout
Same SVG-background layout as Login / Forgot Password. Shows either:
- **Error state** (no token in URL): "Invalid or expired reset link" message
- **Form state**: New Password + Confirm Password fields
- **Success state**: "Password reset successful! Redirecting to login..."

### Behavior
1. On mount, reads the `token` query parameter from the URL
2. If no token present, shows error immediately
3. User enters new password and confirmation
4. Client validates passwords match and are not empty
5. Sends `POST /reset-password` with `{ token, password }`
6. On success, shows success message and redirects to `/login` after 2 seconds
7. On error, shows the error message

### Query Parameters
- `token` — The reset token from the email link (required)
