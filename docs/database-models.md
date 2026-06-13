# Database Models

All models use **Mongoose** and live in `backend/src/models/`. The database name
is `ignition-portal` (set via the path segment in `MONGO_URI`). Collections are
the lowercased pluralized model names (`users`, `applications`, `reviews`, …).

Three models — `User`, `Application`, `Review` — are the live data model. Three
more — `Question`, `File`, `ActivityLog` — are defined but **not wired into any
route** (scaffolding/dead code; decide per `DEVELOPMENT-GUIDE.md` task D1).

Quick reference:

| Model | Collection | Cardinality |
|-------|------------|-------------|
| User | `users` | the account for every applicant/reviewer/admin |
| Application | `applications` | **0..1 per applicant** |
| Review | `reviews` | **1 per (application, reviewer)** |
| Question / File / ActivityLog | `questions` / `files` / `activitylogs` | unused |

---

## User

**File:** `backend/src/models/User.js` · **Collection:** `users`

```js
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  role:     { type: String, enum: ['applicant','reviewer','admin'], default: 'applicant', required: true },
  password: { type: String, required: true },
  resetPasswordToken:     { type: String, default: null },
  resetPasswordExpiresAt: { type: Date,   default: null },
}, { timestamps: true });

// hash password on create/change only
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `name` | String | Yes | — | Trimmed; auto-formatted on signup ("john doe" → "John Doe") |
| `email` | String | Yes | — | **Unique**, lowercased, trimmed; the login key |
| `role` | String enum | Yes | `applicant` | `applicant` \| `reviewer` \| `admin` |
| `password` | String | Yes | — | bcrypt hash (10 rounds); never returned to clients |
| `resetPasswordToken` | String | No | `null` | SHA-256 hash of the reset token |
| `resetPasswordExpiresAt` | Date | No | `null` | Reset expiry (1h after request) |
| `createdAt` / `updatedAt` | Date | Auto | — | `timestamps: true` |

**Indexes:** unique on `email` (from `unique: true`).

**Hooks:** the pre-save hook re-hashes `password` only when it changed — so
updating other fields (e.g. `role`) won't double-hash. There is **no**
`comparePassword` instance method; routes call `bcrypt.compare()` directly.

**Example document**
```json
{
  "_id": "664a1f2e9c1a2b0012ab34cd",
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "role": "applicant",
  "password": "$2b$10$...",        // bcrypt hash
  "resetPasswordToken": null,
  "resetPasswordExpiresAt": null,
  "createdAt": "2026-06-01T12:00:00.000Z",
  "updatedAt": "2026-06-01T12:00:00.000Z"
}
```

---

## Application

**File:** `backend/src/models/Application.js` · **Collection:** `applications`

One per applicant. Responses are stored in **structured, validated sub-documents**
(not a free-form blob). The applicant's name is intentionally **not** duplicated
here — it comes from the linked `User.name`.

```js
const TeammateSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  name:   { type: String, required: true, trim: true },
  email:  { type: String, required: true, trim: true, lowercase: true },
}, { _id: false });

const ApplicationSchema = new mongoose.Schema({
  userId:  { type: ObjectId, ref: 'User', required: true },
  status:  { type: String, enum: ['draft','submitted','under_review','accepted','waitlisted','rejected'], default: 'draft' },
  version: { type: Number, default: 1 },
  personal: {
    gender: { type: String, default: '' },
    age:    { type: Number, default: null },
    ethnicity: { type: String, default: '' },
    country: { type: String, default: '' },
    city:   { type: String, default: '' },
    state:  { type: String, default: '' },
  },
  education: {
    institution: { type: String, default: '' },
    level: { type: String, enum: ['','high-school','undergraduate','graduate','bootcamp','other'], default: '' },
    program: { type: String, default: '' },
    coop: { type: String, enum: ['','yes','no'], default: '' },
  },
  experience: {
    attended2025: { type: String, enum: ['','yes','no'], default: '' },
    hackathonsAttended: { type: Number, min: 0, max: 5, default: null },
  },
  teammates: {
    type: [TeammateSchema], default: [],
    validate: { validator: (v) => v.length <= 3, message: 'You can add at most 3 teammates.' },
  },
  responses: {
    admireDescribe: { type: String, maxlength: 100, default: '' },
    proudProject:   { type: String, maxlength: 500, default: '' },
    motivation:     { type: String, maxlength: 500, default: '' },
  },
  submittedAt: { type: Date, default: null },
}, { timestamps: true });
```

### Slices

**`personal`** — gender, `age` (Number, default `null`), ethnicity, country, city,
state. Empty strings are the "unanswered" sentinel; `age` uses `null`.

**`education`** — institution; `level` (enum incl. `''`); `program` (required on
**submit** only for `undergraduate`/`graduate`); `coop` (`''`/`yes`/`no`).

**`experience`** — `attended2025` (`''`/`yes`/`no`); `hackathonsAttended`
(`min 0`, `max 5`, default `null`). **`0` is a valid answer** — distinguish it
from `null` (unanswered) when validating.

**`teammates`** — array of sub-docs, **max 3** (schema validator → team of 4 with
the applicant). Each is added by user-id lookup; `name`/`email` are **re-derived
server-side** from the referenced `User` and never trusted from the client
(`buildTeammates` in `routes/applications.js`). `_id: false` (no per-teammate id).

**`responses`** — exactly three answers, length-capped at the schema level
(100 / 500 / 500). Sending more returns a `400` (the route checks limits too).

### Status lifecycle

```
draft → submitted → under_review → accepted / waitlisted / rejected
```

| Status | Meaning | Set by |
|--------|---------|--------|
| `draft` | In progress, not submitted | default on create |
| `submitted` | Finalized by the applicant | `POST /applications/:id/submit` |
| `under_review` | ≥1 reviewer has reviewed | first `POST /applications/:id/review` |
| `accepted`/`waitlisted`/`rejected` | Admin decision | `POST /applications/:id/status` |

`POST /applications` refuses to revert a `submitted` app back to `draft`.

### Submit-time completeness

Drafts may be partial, but `POST /applications/:id/submit` runs `getMissingFields`
(`routes/applications.js`) and rejects with the list of missing required fields:
all `personal` except `state`; all `education` except `program` (which is required
only for undergraduate/graduate); both `experience` fields (0 counts as answered);
all three `responses`. Teammates are always optional.

### Indexes

- `userId` — `GET /applications/me`, `POST /applications` (find-or-create).
- compound `{ status: 1, submittedAt: -1 }` — the admin list (match status, sort
  by submitted date). Its `status` prefix also serves status-only scans (reviewer
  pool, stats, CSV).

### Example document (submitted)
```json
{
  "_id": "664bb0...","userId": "664a1f...","status": "submitted","version": 3,
  "personal": { "gender": "female", "age": 20, "ethnicity": "prefer-not-to-say",
                "country": "Canada", "city": "Toronto", "state": "Ontario" },
  "education": { "institution": "University of Toronto", "level": "undergraduate",
                 "program": "Computer Science", "coop": "yes" },
  "experience": { "attended2025": "no", "hackathonsAttended": 2 },
  "teammates": [ { "userId": "664c...", "name": "Sam Lee", "email": "sam@example.com" } ],
  "responses": { "admireDescribe": "Curious and persistent.",
                 "proudProject": "A portal for hackathon applications.",
                 "motivation": "I want to learn and build with others." },
  "submittedAt": "2026-06-10T18:05:00.000Z",
  "createdAt": "2026-06-09T09:00:00.000Z", "updatedAt": "2026-06-10T18:05:00.000Z"
}
```

---

## Review

**File:** `backend/src/models/Review.js` · **Collection:** `reviews`

One review per `(application, reviewer)`, enforced by a **unique** compound index.

```js
const reviewSchema = mongoose.Schema({
  applicationId: { type: ObjectId, ref: 'Application', required: true },
  reviewerId:    { type: ObjectId, ref: 'User', required: true },
  scores:     { type: Map, of: Number, required: true },   // questionKey → numeric level
  totalScore: { type: Number, required: true },
  comment:    { type: String, default: '', trim: true, maxlength: 2000 },
  createdAt:  { type: Date, default: Date.now },
  updatedAt:  { type: Date, default: Date.now },
});
reviewSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ applicationId: 1, reviewerId: 1 }, { unique: true });
```

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `applicationId` | ObjectId→Application | Yes | — | The application reviewed |
| `reviewerId` | ObjectId→User | Yes | — | The reviewer |
| `scores` | Map<String,Number> | Yes | — | Per-question scores; each must be a non-negative number |
| `totalScore` | Number | Yes | — | Server-computed sum of `scores` values |
| `comment` | String | No | `''` | Trimmed, **max 2000 chars** |
| `createdAt` / `updatedAt` | Date | No | `Date.now` | `updatedAt` bumped by the pre-save hook |

**Indexes:** `reviewerId` (a reviewer's queue, `appsReviewed` count); **unique**
`{ applicationId, reviewerId }` (DB-level one-review guard; its `applicationId`
prefix serves "all reviews for an application"). `totalScore` is recomputed
server-side on create and update — never trusted from the client.

**Example document**
```json
{
  "_id": "664ccc...", "applicationId": "664bb0...", "reviewerId": "664rev...",
  "scores": { "technical": 20, "passion": 18, "teamwork": 22, "impact": 19 },
  "totalScore": 79,
  "comment": "Strong project history; clear motivation.",
  "createdAt": "2026-06-11T10:00:00.000Z", "updatedAt": "2026-06-11T10:00:00.000Z"
}
```

---

## Unused models

These exist but no route references them. Keep only if a planned feature needs
them; otherwise candidates for removal.

### Question — `questions`
`key` (unique), `label`, `type` (`text`/`multichoice`/`file`), `required` (default
`false`), `order`. Intended for configurable form questions; the app currently
hardcodes the questions in the frontend.

### File — `files`
`applicationId`→Application, `fileName`, `storagePath`, `uploadedBy`→User,
`uploadedAt`. Scaffolding for resume/file upload (see `DEVELOPMENT-GUIDE.md` task B4).

### ActivityLog — `activitylogs`
`actorId`→User, `action`, `meta`, `createdAt`. Scaffolding for an audit trail.

---

## Entity relationship diagram

```
User (1) ───────── (0..1) Application
  │                          │
  │ (as reviewer)            │
  └──── (0..*) Review ───────┘     Review.scores: Map<questionKey, number>
                                   unique (applicationId, reviewerId)

Application (1) ──── (0..*) File          (unused)
User (1) ──────────── (0..*) ActivityLog  (unused)
```

- A **User** has at most one **Application** (as applicant).
- A **User** writes many **Reviews** (as reviewer) — but only one per Application.
- An **Application** has many **Reviews** from different reviewers.
