# API Reference

Base URL: `http://localhost:8000` (development)

All endpoints return JSON. Protected endpoints require the `Authorization: Bearer <token>` header.

---

## Authentication Endpoints

### POST /signup

Create a new applicant account.

**Auth required:** No

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Validation rules:**
- All fields required
- Name: letters and spaces only (no numbers or special characters)
- Email: valid format, not already registered
- Password: 8+ characters, at least one uppercase, one lowercase, one number

**Name formatting:** The name is auto-formatted before saving. Each word is capitalized: `"john doe"` becomes `"John Doe"`.

**Success response (201):**
```json
{
  "message": "Signup successful",
  "user": { "_id": "...", "name": "John Doe", "email": "john@example.com", "role": "applicant" },
  "token": "eyJhbG..."
}
```

**Error responses:**
- `400` — Missing fields, invalid name, invalid email, or weak password
- `409` — Email already in use

---

### POST /signup/reviewer

Create a new reviewer account. Requires a secret passphrase.

**Auth required:** No

**Request body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Password123",
  "secret": "reviewer_signup_secret_change_this"
}
```

**Success response (201):** Same shape as `/signup`

**Error responses:**
- `400` — Missing fields, invalid name, invalid email, or weak password
- `403` — Wrong secret
- `409` — Email already in use

---

### POST /signup/admin

Create a new admin account. Requires a different secret passphrase.

**Auth required:** No

**Request body:** Same as reviewer, but `secret` must match `ADMIN_SIGNUP_SECRET`.

**Success response (201):** Same shape as `/signup`, with `"role": "admin"`

---

### POST /login

Authenticate an existing user.

**Auth required:** No

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Success response (200):**
```json
{
  "message": "Login successful",
  "user": { "_id": "...", "name": "John Doe", "email": "john@example.com", "role": "applicant" },
  "token": "eyJhbG..."
}
```

**Error responses:**
- `400` — Missing email or password
- `401` — User not found or incorrect password

---

### POST /forgot-password

Request a password reset email.

**Auth required:** No

**Request body:**
```json
{ "email": "john@example.com" }
```

**Success response (200):**
```json
{ "message": "Password reset link sent to your email." }
```

**Error responses:**
- `400` — Missing email
- `404` — No user with that email

**Side effect:** Sends an email containing a reset link with a one-time token valid for 1 hour.

---

### POST /reset-password

Reset a user's password using the token from the email.

**Auth required:** No

**Request body:**
```json
{
  "token": "abc123def456...",
  "password": "NewPassword123"
}
```

**Success response (200):**
```json
{ "message": "Password reset successful. You can now login with your new password." }
```

**Error responses:**
- `400` — Missing token/password, invalid/expired token, or weak password

---

## Application Endpoints

All application endpoints are mounted under `/applications`.

### GET /applications

Get all applications. **Admin only.**

**Auth required:** Yes (admin)

**Success response (200):**
```json
{
  "message": "All applications fetched",
  "applications": [
    {
      "_id": "...",
      "userId": { "_id": "...", "name": "John Doe", "email": "john@example.com", "role": "applicant" },
      "status": "submitted",
      "version": 2,
      "answers": { ... },
      "submittedAt": "2026-05-01T...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### GET /applications/reviewer

Get all non-draft applications with the current reviewer's review status and score.

**Auth required:** Yes (reviewer or admin)

**Success response (200):**
```json
{
  "message": "Reviewer applications fetched",
  "applications": [
    {
      "_id": "...",
      "userId": { "_id": "...", "name": "John Doe", "email": "john@example.com" },
      "status": "submitted",
      "answers": { ... },
      "submittedAt": "2026-05-01T...",
      "createdAt": "...",
      "reviewStatus": "pending",
      "yourScore": null,
      "reviewId": null
    },
    {
      "_id": "...",
      "userId": { ... },
      "status": "under_review",
      "answers": { ... },
      "reviewStatus": "reviewed",
      "yourScore": 85,
      "reviewId": "..."
    }
  ]
}
```

**Key fields added by this endpoint:**
- `reviewStatus` — `"pending"` if the current reviewer has not reviewed this app, `"reviewed"` if they have
- `yourScore` — The current reviewer's total score, or `null`
- `reviewId` — The current reviewer's review document ID, or `null`

---

### GET /applications/me

Get all applications belonging to the current user.

**Auth required:** Yes (any role)

**Success response (200):**
```json
{
  "message": "User applications fetched",
  "applications": [ { ... } ]
}
```

**Error responses:**
- `404` — No applications found for this user

---

### GET /applications/:id

Get a single application by its ID.

**Auth required:** Yes (reviewer or admin)

**Success response (200):**
```json
{
  "message": "Application fetched",
  "application": { "_id": "...", "userId": { ... }, "status": "submitted", ... }
}
```

**Error responses:**
- `400` — Invalid ObjectId format
- `404` — Application not found

---

### POST /applications

Create or update the current user's application.

**Auth required:** Yes (any role)

**Request body:**
```json
{
  "answers": { "attended2025": "yes", "hackathonsAttended": "3" },
  "status": "draft"
}
```

**Behavior:**
- If the user has no application, creates one
- If the user already has an application, updates it and increments `version`
- Cannot revert a `submitted` application back to `draft`
- If `status` is `"submitted"`, sets `submittedAt` to the current timestamp

**Success responses:**
- `201` — New application created
- `200` — Existing application updated

---

### POST /applications/:id/submit

Submit an application (change status from `draft` to `submitted`).

**Auth required:** Yes (any role, but must own the application)

**Request body:** None

**Behavior:**
- Verifies the current user owns the application
- Only allows submission if status is `draft`
- Sets `status` to `"submitted"` and `submittedAt` to now

**Success response (200):**
```json
{
  "message": "Application submitted successfully",
  "application": { ... }
}
```

**Error responses:**
- `400` — Invalid ID or application not in draft status
- `403` — Not the application owner
- `404` — Application not found

---

### POST /applications/:id/status

Change an application's status. **Admin only.**

**Auth required:** Yes (admin)

**Request body:**
```json
{ "status": "accepted" }
```

Valid statuses: `draft`, `submitted`, `under_review`, `accepted`, `waitlisted`, `rejected`

**Success response (200):**
```json
{
  "message": "Application status updated successfully",
  "application": { ... }
}
```

---

## Review Endpoints

### POST /applications/:id/review

Submit a review for an application.

**Auth required:** Yes (reviewer or admin)

**Request body:**
```json
{
  "scores": {
    "creativity": 8,
    "technical": 7,
    "impact": 9
  }
}
```

**Behavior:**
- Application must be in `submitted` or `under_review` status
- Each reviewer can only review an application once (409 if duplicate)
- `totalScore` is computed as the sum of all score values
- If the application was `submitted`, it transitions to `under_review`

**Success response (201):**
```json
{
  "message": "Review submitted",
  "review": { "_id": "...", "scores": { ... }, "totalScore": 24, ... }
}
```

**Error responses:**
- `400` — Missing/invalid scores, invalid ID, or wrong application status
- `404` — Application or reviewer not found
- `409` — Reviewer has already reviewed this application

---

### PUT /applications/:id/review

Update an existing review.

**Auth required:** Yes (reviewer or admin)

**Request body:** Same shape as POST

**Behavior:**
- Finds the existing review by `(applicationId, reviewerId)`
- Replaces `scores` and recomputes `totalScore`

**Success response (200):**
```json
{
  "message": "Review updated",
  "review": { ... }
}
```

---

### GET /applications/:id/review/me

Get the current reviewer's review for an application.

**Auth required:** Yes (reviewer or admin)

**Success response (200):**
```json
{
  "message": "Review found",
  "review": { "_id": "...", "scores": { ... }, "totalScore": 24, ... }
}
```

**Error responses:**
- `404` — Application not found or no review from this reviewer

---

### GET /applications/:id/reviews

Get all reviews for an application. **Admin only.**

**Auth required:** Yes (admin)

**Success response (200):**
```json
{
  "message": "Reviews fetched",
  "reviews": [
    { "_id": "...", "reviewerId": { "name": "...", "email": "..." }, "totalScore": 24, ... }
  ]
}
```

Reviews are sorted by `totalScore` descending.

---

## Test Endpoints

Mounted under `/api/test`. These are sandbox endpoints for development testing and should NOT be used in production.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/test/sunny-test-user` | Creates a test admin user |
| POST | `/api/test/anish-test-login` | Creates a test user and returns login credentials |
| GET | `/api/test/anish-test-get-all-applications` | Creates test applications |
| GET | `/api/test/anish-test-get-application-by-id` | Creates a test application and returns its ID |
| POST | `/api/test/anish-test-create-application` | Creates a test application |
| POST | `/api/test/anish-test-update-application` | Creates and updates a test application |
| GET | `/api/test/anish-test-get-user-applications` | Creates test applications for a user |
| POST | `/api/test/anish-test-signup` | Returns signup test instructions |
| GET | `/api/test/youssef-test-question` | Creates test Question documents |
| GET | `/api/test/youssef-test-file` | Creates a test File document |
| GET | `/api/test/youssef-test-application` | Creates a test Application document |
