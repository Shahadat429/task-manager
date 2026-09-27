# Task Manager

A multi-tenant team task-management tool — a scoped-down Trello/Asana. Multiple isolated workspaces live in the same database, each with its own members, roles, projects, and tasks, with live updates when teammates make changes.

> 🚧 **Status: in active development.** This README reflects the planned scope; see [Roadmap](#roadmap) for what's actually built so far.

## Overview

Teams need a shared place to organize work without stepping on each other's data. This app supports multiple independent workspaces (e.g. different companies or teams) in one deployment, each with role-based access control, project/task management, and real-time collaboration.

## Features

- **Multi-tenancy** — isolated workspaces, each with its own members, projects, and tasks
- **Auth** — JWT-based signup/login, password hashing with bcrypt
- **Roles** — owner / admin / member, enforced on every protected route
- **Projects & tasks** — full CRUD, with status, assignee, due date, and priority
- **Real-time** — live task updates via Socket.io when teammates make changes
- **Notifications** — in-app alert when you're assigned a task

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind |
| API | Next.js API routes, Zod for validation |
| Database | MongoDB Atlas, Mongoose ODM |
| Auth | JSON Web Tokens, bcryptjs |
| Real-time | Standalone Express + Socket.io server (separate repo/deploy) |
| Deployment | Vercel (app) + Render/Railway (realtime server) |

## Architecture

This project is split across two services:

- **`task-manager`** (this repo) — the Next.js app. Handles the UI, authentication, and all CRUD via API routes.
- **`realtime-server`** — a standalone Express + Socket.io service that broadcasts live task updates. It verifies incoming connections using the same JWT secret as this app.

```
┌─────────────┐        REST/API routes        ┌──────────────┐
│   Next.js    │ ─────────────────────────────▶ │  MongoDB Atlas│
│  (frontend + │                                 └──────────────┘
│   API routes)│
└──────┬───────┘
       │ socket.io-client
       ▼
┌─────────────────┐
│ realtime-server  │
│ (Express +       │
│  Socket.io)      │
└─────────────────┘
```

## Getting Started

### Prerequisites

- Node.js (LTS)
- A MongoDB Atlas cluster (connection string)
- The [`realtime-server`](#) running (for live updates)

### Installation

```bash
git clone https://github.com/Shahadat429/task-manager.git
cd task-manager
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_shared_jwt_secret
```

> `JWT_SECRET` must match the one set in `realtime-server/.env`, since the real-time server verifies tokens issued here.

### Run locally

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Project Structure

```
task-manager/
├── src/
│   ├── app/            # App Router pages & API routes
│   ├── lib/            # DB connection, auth helpers
│   ├── models/         # Mongoose schemas
│   └── components/     # UI components
├── .env.local
└── package.json
```

## Roadmap

- [x] Project scaffolding (Next.js + TypeScript)
- [ ] **Phase 1** — User/Workspace/Membership schema, JWT auth, protected routes
- [ ] **Phase 2** — Project & task CRUD, role-based permissions
- [ ] **Phase 3** — Real-time layer (Socket.io integration)
- [ ] **Phase 4** — Validation, error handling, deployment

## Author

**Shahadat** — [GitHub](https://github.com/Shahadat429)

## License

MIT
