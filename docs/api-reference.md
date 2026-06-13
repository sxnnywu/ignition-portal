# API Reference

Base URL: `http://localhost:8000` (development)

All endpoints return JSON. Protected endpoints require the `Authorization: Bearer <token>` header.

**Rate limiting:** the auth endpoints (`POST /login`, `/signup`, `/signup/reviewer`, `/signup/admin`, `/forgot-password`) are rate-limited per client IP and return **429** with `{ "message": ... }` once the limit is exceeded (see [Authentication › Rate Limiting](./authentication.md#rate-limiting)). Security headers are applied globally by `helmet`.

**Common error shapes:** validation `400`, auth `401`, role `403`, not-found `404`, conflict `409`, rate-limit `429`, and server `500` all return `{ "message": "..." }`.

---

## Endpoint index

**Auth** (mounted at `/`, in `routes/signup.js`)

| Method & path | Auth | Purpose |
|---------------|------|---------|
| `POST /signup` | public (rate-limited) | Create an applicant |
| `POST /signup/reviewer` | secret | Create a reviewer |
| `POST /signup/admin` | secret | Create an admin |
| `POST /login` | public (rate-limited) | Log in |
| `POST /forgot-password` | public (rate-limited) | Request a reset email |
| `POST /reset-password` | public | Set a new password via token |

**Applications** (mounted at `/applications`, in `routes/applications.js`)

| Method & path | Auth | Purpose |
|---------------|------|---------|
| `POST /applications` | applicant | Create/update the draft (find-or-create, per-slice) |
| `GET /applications/me` | any auth | Current user's application(s) |
| `GET /applications/teammate/:userId` | any auth | Look up a teammate by user-id |
| `POST /applications/:id/submit` | owner | Submit (runs completeness validation) |
| `GET /applications` | admin | All applications |
| `GET /applications/reviewer` | reviewer/admin | The review pool (+ your review status/score) |
| `GET /applications/:id` | reviewer/admin | One application (populated) |
| `POST /applications/:id/status` | admin | Change status (accept/waitlist/reject/…) |
| `POST /applications/:id/review` | reviewer/admin | Create a review |
| `PUT /applications/:id/review` | reviewer/admin | Update your own review |
| `GET /applications/:id/review/me` | reviewer/admin | Your review for an application |
| `GET /applications/:id/reviews` | admin | All reviews for an application |

**Admin** (mounted at `/api/admin`, in `routes/admin.js`)

| Method & path | Auth | Purpose |
|---------------|------|---------|
| `GET /api/admin/stats` | admin | Status counts + reviewer coverage |
| `GET /api/admin/applications` | admin | Paginated/filterable/sortable list |
| `GET /api/admin/export-csv` | admin | CSV export |
| `GET /api/admin/users` | admin | Paginated user list |
| `POST /api/admin/users` | admin | Create a user (any role) |
| `PUT /api/admin/users/:id/role` | admin | Change a user's role |
| `DELETE /api/admin/users/:id` | admin | Delete a user (cascades reviews + application) |

Full request/response details for each follow below.

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
      "personal": { "gender": "male", "age": 20, "ethnicity": "...", "country": "Canada", "city": "Toronto", "state": "Ontario" },
      "education": { "institution": "UofT", "level": "undergraduate", "program": "CS", "coop": "yes" },
      "experience": { "attended2025": "no", "hackathonsAttended": 2 },
      "teammates": [ { "userId": "...", "name": "Grace Hopper", "email": "grace@example.com" } ],
      "responses": { "admireDescribe": "...", "proudProject": "...", "motivation": "..." },
      "submittedAt": "2026-05-01T...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

> The application document uses **structured slices** (`personal`, `education`,
> `experience`, `teammates`, `responses`) — see [Database Models](./database-models.md#application)
> for every field. Examples below abbreviate them as `"personal": { ... }` etc.

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
      "personal": { ... },
      "education": { ... },
      "experience": { ... },
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
      "personal": { ... },
      "education": { ... },
      "experience": { ... },
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

### GET /applications/teammate/:userId

Look up a fellow applicant by their user id (used by the teammates step). Returns
just enough to display them. Teammates must be applicants and cannot be yourself.

**Auth required:** Yes (any role)

**Success response (200):**
```json
{
  "message": "User found",
  "user": { "_id": "...", "name": "Grace Hopper", "firstName": "Grace", "lastName": "Hopper", "email": "grace@example.com" }
}
```

**Error responses:**
- `400` — The id is your own
- `404` — Malformed id, or no applicant with that id

---

### POST /applications

Create or update the current user's application. Accepts **any subset** of the
structured slices — drafts may be partial.

**Auth required:** Yes (any role)

**Request body (all fields optional):**
```json
{
  "personal":   { "gender": "female", "age": 20, "ethnicity": "...", "country": "Canada", "city": "Toronto", "state": "Ontario" },
  "education":  { "institution": "UofT", "level": "undergraduate", "program": "CS", "coop": "yes" },
  "experience": { "attended2025": "no", "hackathonsAttended": 2 },
  "teammates":  ["<userId1>", "<userId2>"],
  "responses":  { "admireDescribe": "...", "proudProject": "...", "motivation": "..." },
  "status": "draft"
}
```

**Behavior:**
- If the user has no application, creates one; otherwise updates it and increments `version`
- `teammates` is an array of **user ids** (max 3); name/email are re-derived from
  the DB server-side. Rejects yourself, duplicates, and non-applicants (400)
- `responses` are length-validated (100/500/500); `age`/`hackathonsAttended`
  accept numeric strings and treat `""` as `null`
- Cannot revert a `submitted` application back to `draft`
- If `status` is `"submitted"`, sets `submittedAt` to the current timestamp

**Success responses:**
- `201` — New application created
- `200` — Existing application updated

**Error responses:**
- `400` — Invalid teammate list, over-length response, or schema validation error

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
  },
  "comment": "Strong project experience; would be a great fit."
}
```

**Behavior:**
- Application must be in `submitted` or `under_review` status
- Each reviewer can only review an application once (409 if duplicate)
- `totalScore` is computed as the sum of all score values
- `comment` is optional — a string, trimmed, max 2000 characters (400 otherwise)
- If the application was `submitted`, it transitions to `under_review`

**Success response (201):**
```json
{
  "message": "Review submitted",
  "review": { "_id": "...", "scores": { ... }, "totalScore": 24, "comment": "...", ... }
}
```

**Error responses:**
- `400` — Missing/invalid scores, invalid comment, invalid ID, or wrong application status
- `404` — Application or reviewer not found
- `409` — Reviewer has already reviewed this application

---

### PUT /applications/:id/review

Update an existing review.

**Auth required:** Yes (reviewer or admin)

**Request body:** Same shape as POST (`scores` + optional `comment`)

**Behavior:**
- Finds the existing review by `(applicationId, reviewerId)`
- Replaces `scores` and recomputes `totalScore`
- Updates `comment` if provided; omitting it preserves the existing comment

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

Reviews are sorted by `totalScore` descending. Each review includes its
`comment`.

---

## Admin Endpoints

All admin endpoints are mounted under `/api/admin` and require an **admin** token.

### GET /api/admin/stats

Dashboard summary.

**Success response (200):**
```json
{
  "statusCounts": { "submitted": 3, "under_review": 5, "accepted": 2, "waitlisted": 0, "rejected": 1 },
  "reviewerCoverage": { "full": 4, "partial": 2, "none": 5 },
  "totalApplications": 11
}
```
`reviewerCoverage` buckets non-draft applications by review count: `none` (0),
`partial` (1), `full` (2+). `totalApplications` excludes drafts.

---

### GET /api/admin/applications

Paginated, filterable list of non-draft applications (drafts are excluded).

**Query params:** `page` (default 1), `limit` (default 20, max 100),
`status` (`all` or a status), `search` (matches user name/email),
`sort` (`submittedAt` | `score` | `status`), `order` (`asc` | `desc`).

**Success response (200):**
```json
{
  "applications": [
    { "_id": "...", "status": "submitted", "education": { ... }, "submittedAt": "...",
      "user": { "_id": "...", "name": "...", "email": "..." }, "reviewCount": 2, "avgScore": 24 }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 11, "totalPages": 1 }
}
```

---

### GET /api/admin/export-csv

Streams the (optionally filtered) applications as a CSV attachment. Supports the
same `status` and `search` query params. Returns `Content-Type: text/csv` with
columns: ID, Name, Email, School, Status, Avg Score, Reviews, Submitted Date.

---

### GET /api/admin/users

Paginated, filterable list of users with `appsReviewed` counts.

**Query params:** `page`, `limit`, `role` (`all` or a role), `search`.

---

### POST /api/admin/users

Create a user directly. **Body:** `{ name, email, role, password }`.
Returns `201` with the created user, `400` for missing/invalid fields, `409` if
the email exists.

---

### PUT /api/admin/users/:id/role

Change a user's role. **Body:** `{ role }`. Returns `400` if you try to change
your own role or pass an invalid role, `404` if the user is not found.

---

### DELETE /api/admin/users/:id

Delete a user and cascade-delete their application and any reviews they wrote.
Returns `400` if you try to delete your own account, `404` if not found.
