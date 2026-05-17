# Environment Variables

All environment variables are defined in `backend/.env` and loaded by the `dotenv` package at server startup.

## Required Variables

### `MONGO_URI`
**MongoDB connection string.** Connects the backend to MongoDB Atlas (or local MongoDB).

```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ignition-portal?ssl=true&...
```

**Critical:** The database name (`ignition-portal`) must appear directly after the host/port, before the `?` query string. If omitted, Mongoose defaults to the `test` database and your data will be in the wrong place.

### `JWT_SECRET`
**Secret key used to sign and verify JWT tokens.** All authentication tokens are signed with this value. If changed, all existing tokens become invalid and users must log in again.

```
JWT_SECRET=your_very_secure_jwt_secret_key_here_change_in_production
```

In production, use a long random string (32+ characters).

### `CORS_ORIGIN`
**Comma-separated list of allowed origins for CORS.** Controls which frontend URLs can make API requests.

```
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

If empty or unset, CORS allows all origins (`origin: true`).

### `REVIEWER_SIGNUP_SECRET`
**Secret passphrase required to create a reviewer account.** Passed in the `secret` field of `POST /signup/reviewer`. Prevents unauthorized users from creating reviewer accounts.

```
REVIEWER_SIGNUP_SECRET=reviewer_signup_secret_change_this
```

### `ADMIN_SIGNUP_SECRET`
**Secret passphrase required to create an admin account.** Same mechanism as the reviewer secret, for `POST /signup/admin`.

```
ADMIN_SIGNUP_SECRET=admin_signup_secret_change_this
```

## Email Variables (Forgot Password)

These are required only if the forgot-password feature is used.

### `EMAIL_SERVICE`
The email provider. Default: `gmail`.

### `EMAIL_USER`
The sending email address (e.g., `noreply@ignitionhacks.com`).

### `EMAIL_PASSWORD`
The email password or app-specific password. For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password.

### `FRONTEND_URL`
The URL where the frontend is hosted. Used to construct password reset links in emails.

```
FRONTEND_URL=http://localhost:5173
```

The reset email will contain a link like: `http://localhost:5173/reset-password?token=abc123`

## Server Configuration

### `PORT`
The port the Express server listens on. Default: `8000`.

```
PORT=8000
```

The Vite proxy in `frontend/vite.config.js` is hardcoded to forward to `http://localhost:8000`. If you change this port, update the Vite config as well.

## Frontend Environment Variables

The frontend uses Vite's `import.meta.env` system. Currently, one optional variable is supported:

### `VITE_API_BASE_URL`
**Optional.** If set, all API calls will be prefixed with this URL instead of using relative paths.

```
VITE_API_BASE_URL=https://api.ignitionhacks.com
```

In development, this is typically left unset — the Vite proxy handles routing. In production, set this to the backend's public URL.
