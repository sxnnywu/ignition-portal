# Getting Started

## Prerequisites

- **Node.js** 18 or higher
- **npm** (comes with Node.js)
- **MongoDB Atlas** account with a cluster (or a local MongoDB instance)
- **Git**

## Clone the Repository

```bash
git clone <repository-url>
cd ignition-portal
```

## Backend Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create the environment file

Create a `.env` file in the `backend/` directory:

```env
# MongoDB connection string
# IMPORTANT: The database name goes AFTER the host:port and BEFORE the ?
# Example: mongodb+srv://user:pass@cluster.mongodb.net/ignition-portal?retryWrites=true
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ignition-portal?ssl=true&replicaSet=<replica-set>&authSource=admin&appName=<app-name>

# JWT secret key (change this in production!)
JWT_SECRET=your_very_secure_jwt_secret_key_here_change_in_production

# CORS allowed origins
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Signup secrets for privileged roles
REVIEWER_SIGNUP_SECRET=reviewer_signup_secret_change_this
ADMIN_SIGNUP_SECRET=admin_signup_secret_change_this

# Email configuration (for forgot password feature)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here

# Frontend URL (used in password reset email links)
FRONTEND_URL=http://localhost:5173

# Server port
PORT=8000
```

See [Environment Variables](./environment-variables.md) for detailed explanations of each variable.

### 3. Start the backend

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

The server will print:
```
MongoDB connected successfully
Server running on port 8000
```

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

Vite will start on `http://localhost:5173`. The dev server automatically proxies API requests to `localhost:8000`.

### 3. Build for production

```bash
npm run build
```

Output goes to `frontend/dist/`.

## Creating Test Accounts

### Applicant (regular user)
Sign up through the UI at `http://localhost:5173/signup`, or via API:

```bash
curl -X POST http://localhost:8000/signup \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "Password123"}'
```

### Reviewer
Requires the reviewer signup secret:

```bash
curl -X POST http://localhost:8000/signup/reviewer \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith", "email": "jane@example.com", "password": "Password123", "secret": "reviewer_signup_secret_change_this"}'
```

### Admin
Requires the admin signup secret:

```bash
curl -X POST http://localhost:8000/signup/admin \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin User", "email": "admin@example.com", "password": "Password123", "secret": "admin_signup_secret_change_this"}'
```

## Running Both Simultaneously

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Common Issues

| Problem | Solution |
|---------|----------|
| `MongoDB connection failed` | Check your `MONGO_URI` — the database name must be between the host and the `?` |
| `ECONNREFUSED` on API calls | Make sure the backend is running on port 8000 |
| Blank page on `/reviewer` | Clear sessionStorage (F12 → Application → Session Storage → Clear), then log in with a reviewer account |
| `401 Unauthorized` on every request | Your JWT token may be expired or from a different database. Clear sessionStorage and re-login |
| `Cannot find module` errors | Run `npm install` in the appropriate directory |
