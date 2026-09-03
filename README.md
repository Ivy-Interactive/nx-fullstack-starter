# Nx Monorepo (Frontend + Backend + SQLite)

A modern, high-performance fullstack monorepo managed with [Nx](https://nx.dev) and [pnpm](https://pnpm.io). Designed for independent port declarations and optimized for **Ivy Tendril** stack analysis, verification pipelines (`NpmLint`, `NpmBuild`, `NpmTest`), and review actions.

## 🚀 Tech Stack

- **Monorepo**: [Nx](https://nx.dev) + [pnpm](https://pnpm.io) workspaces
- **Frontend**: [React 19](https://react.dev), [Vite](https://vite.dev), [Tailwind CSS v4](https://tailwindcss.com), [Lucide React](https://lucide.dev)
- **Backend**: [Fastify](https://fastify.dev), [TypeScript](https://www.typescriptlang.org), Node.js 24
- **Database**: [SQLite](https://www.sqlite.org) (`better-sqlite3`), [Drizzle ORM](https://orm.drizzle.team)
- **Testing**: [Vitest](https://vitest.dev) (Unit & Integration tests)
- **Linting**: ESLint 9 (flat config)

## 📁 Repository Structure

```tree
├── apps/
│   ├── backend/               # Fastify API + SQLite Drizzle Layer (Port 3001)
│   │   ├── src/
│   │   │   ├── db/            # Schema, SQLite connection, auto-seeding
│   │   │   ├── index.ts       # Fastify server & routes
│   │   │   └── index.test.ts  # Vitest integration tests
│   │   └── .env.example
│   └── frontend/              # React 19 + Vite Dashboard (Port 3000)
│       ├── src/
│       │   ├── App.tsx        # Dashboard UI with SQLite item management
│       │   └── App.test.tsx   # Vitest React tests
│       └── .env.example
├── packages/
│   └── shared/                # Shared TypeScript models and API contracts
├── nx.json                    # Nx workspace task pipeline configuration
├── pnpm-workspace.yaml        # Workspace definitions
└── tsconfig.base.json         # Base TypeScript config with path aliases
```

## ⚙️ Port Configuration

Ports can be independently configured via `.env` files in each service:

| Service | Environment Variable | Default Port | Config File |
|---------|----------------------|--------------|-------------|
| **Frontend** | `PORT` / `VITE_PORT` | `3000` | `apps/frontend/.env` |
| **Backend** | `PORT` | `3001` | `apps/backend/.env` |
| **Vite API Target** | `VITE_API_URL` | `http://localhost:3001` | `apps/frontend/.env` |

## 🛠️ Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Both Services (Nx Parallel Dev)

```bash
pnpm dev
```

Or run individual apps:

```bash
# Backend only (http://localhost:3001)
pnpm dev:backend

# Frontend only (http://localhost:3000)
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

This repository is tailored for Ivy Tendril:
- **Stack Analyzer**: Automatically classifies components into `fe` (React/Vite/Tailwind), `be` (Fastify/Node), `db` (SQLite), and `test` (Vitest).
- **Verifications**: Root and workspace scripts adhere to Tendril's `NpmLint`, `NpmBuild`, and `NpmTest` verification conventions.
- **Review Actions**: Each workspace contains standard `dev` scripts compatible with Tendril's worktree launching and `--open` flags.
