# Architecture Overview

## System Design

Ignition Portal is a monorepo containing two standalone applications that communicate over HTTP:

```
ignition-portal/
├── backend/    ← Express.js REST API  (Node 18+, port 8000)
├── frontend/   ← React 19 SPA        (Vite 7, port 5173)
└── docs/       ← This documentation
```

### Request Flow (Development)

```
Browser (localhost:5173)
   │
   ├── Static assets (.jsx, .css, images) ──→ Vite dev server (serves directly)
   │
   └── API calls (/applications/*, /login, /signup, etc.)
           │
           └── Vite proxy ──→ Express backend (localhost:8000)
                                    │
                                    └── MongoDB Atlas (cloud)
```

In development, the Vite dev server intercepts API paths (configured in `vite.config.js`) and proxies them to the Express backend. The frontend never calls `localhost:8000` directly — all requests go through `localhost:5173`.

## Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 5.1 | HTTP framework |
| Mongoose | 8.20 | MongoDB ODM |
| MongoDB Atlas | — | Cloud database |
| JWT (jsonwebtoken) | 9.0 | Authentication tokens |
| bcryptjs | 3.0 | Password hashing |
| nodemailer | 8.0 | Password reset emails |
| dotenv | 17.2 | Environment variable loading |
| nodemon | 3.1 | Dev auto-restart |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2 | UI library |
| React Router DOM | 7.13 | Client-side routing |
| Vite | 7.3 | Build tool & dev server |
| Tailwind CSS | 4.2 | Utility CSS (imported but mostly custom CSS is used) |
| Axios | 1.13 | HTTP client (installed but `fetch` is used in practice) |
| Lucide React | 0.577 | Icons (installed, not widely used yet) |
| React Query | 5.90 | Data fetching (installed, not yet integrated) |

## Key Design Decisions

### 1. Session-Based Auth via sessionStorage
Authentication tokens and user data are stored in `sessionStorage` (not `localStorage`). This means:
- Data is cleared when the browser tab closes
- Each tab has its own session
- More secure than localStorage for sensitive tokens

### 2. Role-Based Architecture
The system has three roles with increasing privilege:
- **applicant** — can fill out and submit hackathon applications
- **reviewer** — can view all submitted applications and score them
- **admin** — has all reviewer permissions plus admin-specific capabilities

Role enforcement happens at two levels:
- **Backend**: JWT middleware extracts the role, then `requireRole()` middleware blocks unauthorized access
- **Frontend**: `RequireRole` component redirects users away from pages they cannot access

### 3. CSS Class Prefixing
To prevent class name collisions across the growing codebase, every component group uses a unique prefix:
- `auth-login-`, `auth-signup-`, `auth-forgot-` — authentication pages
- `hk-` — shared hacker form elements (HkFormPage)
- `hk-dash-` — hacker dashboard
- `hk-landing-` — hacker landing page
- `hk-sub-` — hacker submission page
- `rv-` — reviewer-specific components
- `portal-` — shared portal components (navbar, sidebar)
- `notfound-` — 404 page

### 4. Background PNG Overlay Pattern
The hacker application form pages (Info, Education, Experience, Teammates) use a unique layout pattern: a full-screen background PNG image with absolutely positioned form fields overlaid on top using container query units (`cqw`) for responsive sizing. This allows designers to create pixel-perfect layouts in Figma that translate directly to the web.

### 5. Vite Dev Proxy
Instead of configuring CORS for every endpoint or using a full `VITE_API_BASE_URL`, the project uses Vite's built-in proxy. The frontend makes relative API calls (`/applications/reviewer`) and Vite forwards them to `localhost:8000`. This simplifies development and avoids CORS issues.

## Communication Between Frontend and Backend

All API communication uses the native `fetch()` API (not Axios, despite it being installed). The pattern is:

1. Frontend calls `apiUrl('/some-path')` which returns the path as-is (no base URL prefix in dev)
2. `fetch()` sends the request to `localhost:5173/some-path`
3. Vite proxy matches the path prefix and forwards to `localhost:8000/some-path`
4. Express handles the request and returns JSON
5. Frontend processes the JSON response

Authentication is done via the `Authorization: Bearer <token>` header on every protected request.
