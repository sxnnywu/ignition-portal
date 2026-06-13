# Ignition Portal Documentation

Welcome to the Ignition Portal documentation. This portal is the web application used by **Ignition Hacks V7**, a hackathon event. It serves three user roles: applicants (hackers), reviewers, and admins.

## Documentation Index

| Document | Description |
|----------|-------------|
| [**Codebase Guide (start here)**](./codebase-guide.md) | Fast orientation to the whole project — read this first |
| [Architecture Overview](./architecture-overview.md) | High-level system design, tech stack, and how frontend/backend communicate |
| [Getting Started](./getting-started.md) | How to clone, install, configure, and run the project locally |
| [Environment Variables](./environment-variables.md) | Every environment variable the backend expects, with explanations |
| [Authentication & Authorization](./authentication.md) | Login/signup flow, JWT tokens, session storage, middleware, and role-based access |
| [Security](./security.md) | Consolidated security reference: auth, passwords, RBAC, rate limiting, helmet, CORS, secrets, and known gaps |
| [Database Models](./database-models.md) | Every Mongoose model (User, Application, Review, etc.) with field-by-field documentation |
| [API Reference](./api-reference.md) | Every backend endpoint — method, path, auth requirements, request/response shapes |
| [Testing](./testing.md) | The end-to-end API test suite — how to run it and what it covers |
| [Frontend Routing & Guards](./frontend-routing.md) | React Router setup, role-based route guards, and the 404 page |
| [Frontend Pages — Auth](./frontend-pages-auth.md) | Login, Signup, Forgot Password, and Reset Password pages |
| [Frontend Pages — Hacker](./frontend-pages-hacker.md) | Dashboard, Landing, and the multi-step application form (Info, Education, Teammates, Questions, Finish) |
| [Frontend Pages — Reviewer](./frontend-pages-reviewer.md) | Reviewer main page, application table, sidebar filtering, and sorting |
| [Shared Components](./shared-components.md) | Reusable components: ApplicationDraftProvider, UserIdBadge, PortalNavBar, PortalSidebar, RequireRole |
| [CSS Architecture](./css-architecture.md) | Naming conventions, prefix strategy, fonts, color palette, and responsive approach |
| [Application Flow — Applicant](./flow-applicant.md) | Step-by-step walkthrough of the full applicant journey |
| [Application Flow — Reviewer](./flow-reviewer.md) | Step-by-step walkthrough of the full reviewer journey |
| [Vite Proxy & Dev Setup](./vite-proxy.md) | How the Vite dev server proxies API calls to the backend |
| [Project Structure](./project-structure.md) | File tree with descriptions of every folder and file |
