# Xynes Platform Config

This repository serves as the central source of truth for the platform's dynamic routing configuration and shared database logic. It is a library and migration tool, not an HTTP service.

## 🎯 Purpose

- **Route Registry**: Defines the `platform.routes` table which maps HTTP paths to internal service actions.
- **Database Schema**: Manages the `platform` schema using Drizzle ORM.
- **Migrations**: Handles database migrations for the platform configuration.

## 🗃️ Data Model

### Platform Routes (`platform.routes`)

| Column | Type | Description |
|--------|------|-------------|
| `method` | `text` | HTTP method (e.g. `GET`, `POST`) |
| `pathPattern` | `text` | Route pattern (e.g. `/workspaces/:workspaceId/blog`) |
| `serviceKey` | `text` | Target service identifier (e.g. `cms-core`) |
| `actionKey` | `text` | Internal action identifier (e.g. `docs.document.create`) |
| `workspaceScoped` | `boolean` | Whether the route requires a workspace ID (default: `true`) |
| `isPublic` | `boolean` | Whether the route is effectively public (default: `false`) |

### Standard Routes
- **Documents**: `/workspaces/:workspaceId/documents` (POST, GET)
- **Blog**: `/workspaces/:workspaceId/blog` (GET, List/Slug)
- **Comments**: `/workspaces/:workspaceId/.../comments` (POST, GET) — seeded as non-public by default (explicit public routes should add rate limiting + spam protection)


## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh)
- Postgres Database (connection string required)

### Installation

```bash
bun install
```

### Environment Variables

Create `.env.dev` (and optionally `.env.localhost`) in the repo root.
This service uses **RBAC** for security, requiring two connection strings:

```env
# Runtime Access (SELECT-only on platform.routes)
DATABASE_URL="postgres://gateway_runtime:pass@host:5432/db"

# Admin Access (Full CRUD - for migrations/seeds)
DATABASE_URL_ADMIN="postgres://platform_admin:pass@host:5432/db"
```

For local development (without custom roles), you can map both to the same `postgres` user.

Run scripts with the chosen env file, for example:

```bash
bun --env-file=.env.dev test
bun --env-file=.env.dev run seed:routes
```

## 🛠️ Scripts

- `bun run migrate`: Apply pending migrations to the database.
- `bun run seed:routes`: Seed the database with initial/example routes (requires `DATABASE_URL_ADMIN`).
- `bun test`: Run test suite.
- `bun run lint`: Lint the codebase.

## 🧪 Testing

We follow TDD with strict coverage requirements (80%+).

```bash
bun test --coverage
```

## 🏗️ Folder Structure

```
xynes-platform-config/
├── drizzle/              # SQL Migrations
├── src/
│   ├── db/               # Drizzle schema definitions
│   │   ├── platformRoutes.ts
│   │   ├── admin.ts      # Admin connection (privileged)
│   │   └── index.ts      # Runtime connection (restricted)
│   ├── seeds/            # Seed data (single source of truth)
│   │   └── routes.ts
│   └── index.ts          # Public API exports
├── scripts/              # Utility scripts (seeding)
└── tests/                # Unit and Integration tests
```

## 🔌 Seeding Routes (SSH tunnel)

1. Start the DB tunnel:
   ```bash
   ssh -N -L 5432:127.0.0.1:5432 xynes-vps
   ```
   See `xynes-infra/infra/SSH_TUNNEL_SUPABASE_DB.md` for the recommended SSH host alias setup.

2. Update `DATABASE_URL` and `DATABASE_URL_ADMIN` in your `.env`.
   - `DATABASE_URL`: `postgres://gateway_runtime:...`
   - `DATABASE_URL_ADMIN`: `postgres://platform_admin:...`

3. Run the seed:
   ```bash
   bun run seed:routes
   ```
