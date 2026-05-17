# Authentication & Authorization

## Overview

The portal uses **JWT (JSON Web Token)** authentication with **role-based access control (RBAC)**. Tokens are stored client-side in `sessionStorage` and sent as Bearer tokens in HTTP headers.

## Authentication Flow

### Signup

```
1. User fills out signup form (firstName, lastName, email, password)
2. Frontend sends POST /signup with { name: "First Last", email, password }
3. Backend validates:
   - All fields present
   - Name contains only letters and spaces (no numbers)
   - Email format is valid
   - Email is not already registered
   - Password meets strength requirements (8+ chars, uppercase, lowercase, number)
4. Backend formats the name (capitalizes first letter of each word)
5. Backend hashes password with bcrypt (10 salt rounds)
6. Backend creates User document in MongoDB
7. Backend signs a JWT with { userId, role } (7-day expiry)
8. Backend returns { token, user: { _id, name, email, role } }
9. Frontend stores token and user in sessionStorage via setAuth()
10. Frontend redirects to /dashboard (applicant) or /reviewer (reviewer/admin)
```

### Login

```
1. User enters email and password
2. Frontend sends POST /login with { email, password }
3. Backend finds user by email
4. Backend compares password hash with bcrypt
5. Backend signs a JWT with { userId, role } (7-day expiry)
6. Backend returns { token, user: { _id, name, email, role } }
7. Frontend stores token and user in sessionStorage via setAuth()
8. Frontend checks user.role:
   - "reviewer" or "admin" → redirect to /reviewer
   - "applicant" → redirect to /dashboard
```

### Password Reset

```
1. User clicks "Forgot Password" → navigates to /forgot-password
2. User enters email → POST /forgot-password
3. Backend generates a random 32-byte reset token
4. Backend hashes the token with SHA-256 and stores it on the User document
5. Backend sets a 1-hour expiry (resetPasswordExpiresAt)
6. Backend sends an email with a link: {FRONTEND_URL}/reset-password?token={rawToken}
7. User clicks the email link → navigates to /reset-password?token=abc123
8. User enters new password and confirmation → POST /reset-password
9. Backend hashes the provided token with SHA-256
10. Backend finds a user with matching hash AND non-expired timestamp
11. Backend updates the password and clears the reset token fields
12. Frontend shows success message and redirects to /login after 2 seconds
```

## JWT Token Structure

The JWT payload contains:
```json
{
  "userId": "664abc123def456...",
  "role": "applicant",
  "iat": 1715100000,
  "exp": 1715704800
}
```

- **userId**: MongoDB ObjectId of the user
- **role**: one of `"applicant"`, `"reviewer"`, `"admin"`
- **iat**: issued-at timestamp
- **exp**: expiration timestamp (7 days after issuance)

Signed with the `JWT_SECRET` environment variable using HS256.

## Client-Side Auth Storage

Located in `frontend/src/lib/auth.js`:

| Function | Description |
|----------|-------------|
| `getToken()` | Returns the JWT from `sessionStorage.getItem('token')`, or `null` |
| `getUser()` | Parses and returns the user JSON from `sessionStorage.getItem('user')`, or `null` |
| `setAuth(token, user)` | Stores both the token and user JSON in sessionStorage |
| `clearAuth()` | Removes both `token` and `user` from sessionStorage |

**Why sessionStorage?** Data is scoped to the browser tab and cleared when the tab closes. This is more secure than localStorage for auth tokens because it limits the exposure window.

## Backend Middleware

### auth.js — Token Verification

**File:** `backend/src/middleware/auth.js`

Extracts and verifies the JWT from the `Authorization` header:

1. Checks for `Authorization: Bearer <token>` header
2. Extracts the token string
3. Verifies the token with `jwt.verify(token, JWT_SECRET)`
4. Attaches `req.user = { userId, role }` to the request
5. Calls `next()` to proceed to the route handler

If the token is missing, malformed, or expired, returns **401 Unauthorized**.

### roles.js — Role Checking

**File:** `backend/src/middleware/roles.js`

A higher-order function that takes allowed roles and returns middleware:

```javascript
requireRole('reviewer', 'admin')
```

1. Checks that `req.user` exists (set by auth middleware)
2. Checks that `req.user.role` is in the allowed roles list
3. If unauthorized, returns **401** (no user) or **403 Forbidden** (wrong role)

**These two middlewares are always used together**, in order:
```javascript
router.get('/reviewer', auth, requireRole('reviewer', 'admin'), handler)
```

## Frontend Route Guards

### RequireRole Component

**File:** `frontend/src/components/auth/RequireRole.jsx`

A wrapper component that protects routes on the client side:

```jsx
<RequireRole allowed={['applicant']}>
  <Dashboard />
</RequireRole>
```

Logic:
1. No token in sessionStorage → redirect to `/login`
2. User role not in `allowed` array → redirect to `/not-found`
3. Otherwise → render children

This component is used in `routes.jsx` to wrap every role-specific route.

## Role Permissions Summary

| Resource | applicant | reviewer | admin |
|----------|-----------|----------|-------|
| Login / Signup pages | Yes | Yes | Yes |
| Dashboard, Landing | Yes | No (→ 404) | No (→ 404) |
| Application form (Info, Education, etc.) | Yes | No (→ 404) | No (→ 404) |
| Submission page | Yes | No (→ 404) | No (→ 404) |
| Reviewer portal (/reviewer) | No (→ 404) | Yes | Yes |
| POST /signup | Yes | Yes | Yes |
| POST /signup/reviewer | Requires secret | Requires secret | Requires secret |
| POST /signup/admin | Requires secret | Requires secret | Requires secret |
| GET /applications/me | Yes | Yes | Yes |
| GET /applications/reviewer | No (403) | Yes | Yes |
| GET /applications (all) | No (403) | No (403) | Yes |
| POST /applications/:id/review | No (403) | Yes | Yes |

## Privileged Account Creation

Reviewer and admin accounts cannot be created through the standard signup UI. They require a secret passphrase:

- **Reviewer**: `POST /signup/reviewer` with `{ secret: REVIEWER_SIGNUP_SECRET }`
- **Admin**: `POST /signup/admin` with `{ secret: ADMIN_SIGNUP_SECRET }`

These secrets are defined in the backend `.env` file and must be shared out-of-band with authorized people.

## Name Validation

All signup routes enforce name validation:
- Names can only contain **letters and spaces** (no numbers, no special characters)
- Names are **auto-formatted**: first letter of each word is capitalized, rest lowercased
- Example: `"jOHN dOE"` becomes `"John Doe"`
