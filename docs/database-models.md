# Database Models

All models use **Mongoose** and are stored in MongoDB Atlas. The database name is `ignition-portal`.

## User

**File:** `backend/src/models/User.js`
**Collection:** `users`

Stores all user accounts — applicants, reviewers, and admins.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | String | Yes | — | Full name, trimmed. Auto-formatted on signup (e.g., "John Doe") |
| `email` | String | Yes | — | Unique, lowercase, trimmed. Used for login |
| `role` | String (enum) | Yes | `"applicant"` | One of: `"applicant"`, `"reviewer"`, `"admin"` |
| `password` | String | Yes | — | bcrypt-hashed password (never stored in plaintext) |
| `resetPasswordToken` | String | No | `null` | SHA-256 hash of the password reset token |
| `resetPasswordExpiresAt` | Date | No | `null` | When the reset token expires (1 hour after creation) |
| `createdAt` | Date | Auto | — | Mongoose timestamp |
| `updatedAt` | Date | Auto | — | Mongoose timestamp |

**Pre-save hook:** Before saving, if the `password` field was modified, it is automatically hashed with bcrypt (10 salt rounds).

**Indexes:** Unique index on `email`.

---

## Application

**File:** `backend/src/models/Application.js`
**Collection:** `applications`

Stores hackathon applications. Each user can have one application.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `userId` | ObjectId (ref: User) | Yes | — | The applicant who owns this application |
| `status` | String (enum) | No | `"draft"` | Application lifecycle state |
| `version` | Number | No | `1` | Incremented each time the application is updated |
| `answers` | Object | No | `{}` | Free-form object storing all form responses |
| `submittedAt` | Date | No | `Date.now` | When the application was submitted |
| `createdAt` | Date | Auto | — | Mongoose timestamp |
| `updatedAt` | Date | Auto | — | Mongoose timestamp |

**Status lifecycle:**
```
draft → submitted → under_review → accepted / waitlisted / rejected
```

- `draft` — Application is in progress, not yet submitted
- `submitted` — Applicant has finalized and submitted
- `under_review` — At least one reviewer has submitted a review
- `accepted` — Admin has accepted the applicant
- `waitlisted` — Admin has waitlisted the applicant
- `rejected` — Admin has rejected the applicant

**The `answers` object** is schema-less. It stores whatever the frontend sends. Currently used keys include:
- `attended2025` — Whether the applicant attended IgnitionHacks 2025
- `hackathonsAttended` — Number of previous hackathons
- `teammates` — Array of `{ name, email }` objects
- `school` — Educational institution name (used in reviewer table)

---

## Review

**File:** `backend/src/models/Review.js`
**Collection:** `reviews`

Stores individual reviewer scores for an application. Each reviewer can submit one review per application.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `applicationId` | ObjectId (ref: Application) | Yes | — | The application being reviewed |
| `reviewerId` | ObjectId (ref: User) | Yes | — | The reviewer who submitted this review |
| `scores` | Map of Number | Yes | — | Key-value pairs of question keys to numeric scores |
| `totalScore` | Number | Yes | — | Sum of all individual scores |
| `createdAt` | Date | No | `Date.now` | When the review was created |
| `updatedAt` | Date | No | `Date.now` | When the review was last updated |

**Pre-save hook:** `updatedAt` is automatically set to `Date.now()` on every save.

**Uniqueness:** There is no database-level unique index on `(applicationId, reviewerId)`, but the application code checks for duplicates before creating a review.

---

## Question

**File:** `backend/src/models/Question.js`
**Collection:** `questions`

Defines the questions in the application form. Currently used for configuration/testing purposes.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `key` | String | Yes | — | Unique identifier for the question (e.g., `"school"`) |
| `label` | String | Yes | — | Human-readable question text |
| `type` | String (enum) | Yes | — | One of: `"text"`, `"multichoice"`, `"file"` |
| `required` | Boolean | No | `false` | Whether the question must be answered |
| `order` | Number | Yes | — | Display order in the form |

**Indexes:** Unique index on `key`.

---

## File

**File:** `backend/src/models/File.js`
**Collection:** `files`

Tracks file uploads associated with applications. The model exists but file upload functionality is not yet fully implemented.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `applicationId` | ObjectId (ref: Application) | Yes | — | The application this file belongs to |
| `fileName` | String | Yes | — | Original file name |
| `storagePath` | String | Yes | — | Server-side storage location |
| `uploadedBy` | ObjectId (ref: User) | Yes | — | The user who uploaded the file |
| `uploadedAt` | Date | No | `Date.now` | When the file was uploaded |

---

## ActivityLog

**File:** `backend/src/models/ActivityLog.js`
**Collection:** `activitylogs`

Tracks user actions for auditing. The model exists but is not yet integrated into any routes.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `actorId` | String (ref: User) | Yes | — | The user who performed the action |
| `action` | String | Yes | — | Description of the action (e.g., "applicant submit") |
| `meta` | String | No | — | Additional metadata about the action |
| `createdAt` | Date | No | `Date.now` | When the action occurred |

---

## Entity Relationship Diagram

```
User (1) ──────── (0..1) Application
  │                         │
  │                         │
  │ (as reviewer)           │
  └──── (0..*) Review ─────┘
                   │
                   └── scores: Map<questionKey, number>

Application (1) ──── (0..*) File

User (1) ──── (0..*) ActivityLog
```

- A **User** can have at most one **Application** (as an applicant)
- A **User** can write many **Reviews** (as a reviewer), but only one per Application
- An **Application** can have many **Reviews** from different reviewers
- An **Application** can have many **Files** attached
- A **User** can generate many **ActivityLog** entries
