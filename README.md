# Nx Monorepo (Frontend + Backend + DB Service)

A modern, high-performance 3-tier monorepo managed with [Nx](https://nx.dev) and [pnpm](https://pnpm.io). Designed with independent service boundaries, dedicated port declarations via `.env` files, and full optimization for **Ivy Tendril** stack analysis, verification pipelines (`NpmLint`, `NpmBuild`, `NpmTest`), and review actions.

## 🚀 Tech Stack

- **Monorepo**: [Nx](https://nx.dev) + [pnpm](https://pnpm.io) workspaces
- **Frontend (`apps/frontend`)**: [React 19](https://react.dev), [Vite](https://vite.dev), [Tailwind CSS v4](https://tailwindcss.com), [Lucide React](https://lucide.dev)
- **Backend API (`apps/backend`)**: [Fastify](https://fastify.dev), [TypeScript](https://www.typescriptlang.org), Node.js 24
- **Database Service (`apps/db-service`)**: [Fastify](https://fastify.dev), [SQLite](https://www.sqlite.org) (`better-sqlite3`), [Drizzle ORM](https://orm.drizzle.team)
- **Shared Library (`packages/shared`)**: Shared TypeScript models, DTOs, and API contracts
- **Testing**: [Vitest](https://vitest.dev)
- **Linting**: ESLint 9 (flat config)

## 📁 Repository Structure

```tree
├── apps/
│   ├── db-service/            # Dedicated SQLite Data Service (Port 3002)
│   │   ├── src/
│   │   │   ├── db/            # Drizzle schema, SQLite connection, auto-seeding
│   │   │   ├── index.ts       # Fastify REST endpoints for SQLite operations
│   │   │   └── index.test.ts  # Vitest integration tests
│   │   └── .env.example
│   ├── backend/               # Backend API Gateway (Port 3001)
│   │   ├── src/
│   │   │   ├── index.ts       # Fastify server talking to DB service
│   │   │   └── index.test.ts  # Vitest integration tests
│   │   └── .env.example
│   └── frontend/              # React 19 + Vite Dashboard (Port 3000)
│       ├── src/
│       │   ├── App.tsx        # Dashboard displaying 3-tier status & live items
│       │   └── App.test.tsx   # Vitest React tests
│       └── .env.example
├── packages/
│   └── shared/                # Shared TypeScript models and API contracts
├── nx.json                    # Nx workspace task pipeline configuration
├── pnpm-workspace.yaml        # Workspace definitions
└── tsconfig.base.json         # Base TypeScript config with path aliases
```

## ⚙️ Port Configuration

Each service declares its own independent port in its dedicated `.env` file:

| Service | Environment Variable | Default Port | Target Config | File |
|---------|----------------------|--------------|---------------|------|
| **Frontend** | `PORT` / `VITE_PORT` | `3000` | Talks to Backend (`http://localhost:3001`) | `apps/frontend/.env` |
| **Backend API** | `PORT` | `3001` | Talks to DB Service (`http://localhost:3002`) | `apps/backend/.env` |
| **DB Service** | `PORT` | `3002` | Manages SQLite directly (`./data/app.db`) | `apps/db-service/.env` |

## 🛠️ Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run All Services (Nx Parallel Dev)

```bash
pnpm dev
```

Or run individual services:

```bash
# Database Service (http://localhost:3002)
pnpm dev:db

# Backend API Gateway (http://localhost:3001)
pnpm dev:backend

# Frontend Dashboard (http://localhost:3000)
pnpm dev:frontend
```

### 3. Build All Projects

```bash
pnpm build
```

### 4. Run Tests

```bash
pnpm test
```

### 5. Run Linting

```bash
pnpm lint
```

## 🔍 Ivy Tendril Integration

- **Stack Analyzer**: Automatically classifies the 3 distinct application components:
  - `apps/frontend`: `fe` (React/Vite/Tailwind/Testing Library/Vitest)
  - `apps/backend`: `be` (Fastify/Node/Vitest)
  - `apps/db-service`: `db` (SQLite/Drizzle ORM/Fastify/Vitest)
- **Verifications**: Root and workspace scripts adhere to Tendril's `NpmLint`, `NpmBuild`, and `NpmTest` verification conventions.
- **Review Actions**: Each workspace contains standard `dev` scripts compatible with Tendril's worktree launching and `--open` flags.
