# Frontend Pages — Auth

These pages handle user authentication. They are publicly accessible (no login required).

## Login

**File:** `frontend/src/pages/auth/Login.jsx`
**CSS:** `frontend/src/pages/auth/Login.css`
**Route:** `/` and `/login`

### Layout
A full-viewport page with a background PNG (`login.png`) overlaid with absolutely positioned form fields. The background image is styled to fill the viewport using container query units.

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

### CSS Prefix: `auth-login-`

---

## Signup

**File:** `frontend/src/pages/auth/Signup.jsx`
**CSS:** `frontend/src/pages/auth/Signup.css`
**Route:** `/signup`

### Layout
Background PNG (`sign-up-bg.png`) with overlaid form card.

### Form Fields
- First name (text)
- Last name (text)
- Email (email)
- Password (password)

### Behavior
1. Client-side validates all fields are filled
2. Client-side checks password strength: 8+ chars, uppercase, lowercase, number
3. Concatenates first and last name: `"${firstName} ${lastName}"`
4. Sends `POST /signup` with `{ name, email, password }`
5. Backend validates name (no numbers), formats it, creates user
6. On success, stores auth and navigates to `/dashboard`

### Links
- "Already have an account? Log in" → navigates to `/login`

### CSS Prefix: `auth-signup-`

---

## Forgot Password

**File:** `frontend/src/pages/auth/ForgotPassword.jsx`
**CSS:** `frontend/src/pages/auth/ForgotPassword.css`
**Route:** `/forgot-password`

### Layout
Background PNG (`reset.png`) with a single email input field and a recover button. A back button in the upper area navigates to `/login`.

### Behavior
1. User enters their email
2. Sends `POST /forgot-password` with `{ email }`
3. On success, clears the email field and shows a success message
4. On error, shows the error message
5. The backend sends an email with a reset link

### CSS Prefix: `auth-forgot-`

---

## Reset Password

**File:** `frontend/src/pages/auth/ResetPassword.jsx`
**CSS:** Reuses `ForgotPassword.css` (shares `auth-forgot-` classes)
**Route:** `/reset-password`

### Layout
Same background as Forgot Password. Shows either:
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
