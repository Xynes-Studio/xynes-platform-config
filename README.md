# Xynes Platform Config

Central source of truth for dynamic routing configuration and shared DB logic.
This repo is a library + migration/seeding tool (not an HTTP service).

## Global Standards
- **Environment segregation**:
   - `.env.localhost`: host-run tooling via SSH tunnel (`127.0.0.1:5432`)
   - `.env.dev`: Docker dev (inside Compose) via `db.local:5432`
- **Least privilege**:
   - `DATABASE_URL` should use a runtime role (SELECT-only)
   - `DATABASE_URL_ADMIN` should use an admin role (migrations/seeds)
- **Testing**: TDD-first, maintain **≥ 80% coverage** (`bun test --coverage`)

SSH tunnel guidance lives in xynes-infra: `xynes-infra/infra/SSH_TUNNEL_SUPABASE_DB.md`.

## Purpose
- **Route registry**: defines `platform.routes` mapping HTTP paths to internal actions
- **DB schema/migrations**: manages the `platform` schema via Drizzle
- **Seeding**: idempotent route seed helpers used by other services

## Data Model

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
- **Me**: `/me` (GET) — auth required, not workspace-scoped
- **Documents**: `/workspaces/:workspaceId/documents` (POST, GET)
- **Blog**: `/workspaces/:workspaceId/blog` (GET, List/Slug)
- **Comments**: `/workspaces/:workspaceId/.../comments` (POST, GET) — seeded as non-public by default (explicit public routes should add rate limiting + spam protection)

### Workspace Invites (INVITES-CORE-1)

- Migration: `platform.workspace_invites` (see `drizzle/0004_workspace_invites.sql`)
- Seeded invite routes live in `src/seeds/routes.ts` and are validated in `tests/seedRoutes.test.ts`


## Getting Started

### Prerequisites
- Bun
- Postgres reachable via SSH tunnel (local) or Docker Compose (dev)

### Install

```bash
bun install
```

### Environment

This repo includes `.env.dev` and `.env.localhost` with placeholder values to ease onboarding.
Do not commit real credentials.

It uses **RBAC** for DB access, so you should provide two connection strings:

```env
# Runtime Access (SELECT-only on platform.routes)
DATABASE_URL="postgres://gateway_runtime:pass@host:5432/db"

# Admin Access (Full CRUD - for migrations/seeds)
DATABASE_URL_ADMIN="postgres://platform_admin:pass@host:5432/db"
```

For local development (without custom roles), you can temporarily point both to the same `postgres` user.

Run scripts with an explicit env file:

```bash
bun --env-file=.env.localhost test
bun --env-file=.env.localhost run seed:routes
```

## Scripts

- `bun run migrate`: Apply pending migrations to the database.
- `bun run seed:routes`: Seed the database with initial/example routes (requires `DATABASE_URL_ADMIN`).
- `bun test`: Run test suite.
- `bun run lint`: Lint the codebase.

## Testing (TDD + Coverage)

- Fast local loop: `bun test`
- Coverage gate: `bun test --coverage` (target ≥ 80%)

## Folder Structure

```
xynes-platform-config/
├── drizzle/              # SQL Migrations
├── src/
│   ├── db/               # Drizzle schema definitions
│   │   ├── platformRoutes.ts
│   │   ├── admin.ts      # Admin connection (privileged)
│   │   └── index.ts      # Runtime connection (restricted)
│   ├── scripts/          # Repo-local scripts (DB seed entrypoint)
│   ├── seeds/            # Seed data (single source of truth)
│   └── index.ts          # Public API exports
├── scripts/              # Utility scripts (docs/seeding)
└── tests/                # Unit + DB-backed tests
```

## Seeding Routes (SSH tunnel)

1. Start the DB tunnel:
   ```bash
   ssh -N -L 5432:127.0.0.1:5432 xynes@84.247.176.134
   ```
   See `xynes-infra/infra/SSH_TUNNEL_SUPABASE_DB.md` for the recommended SSH host alias setup.

2. Update `DATABASE_URL` and `DATABASE_URL_ADMIN` in your env file.
   - `DATABASE_URL`: `postgres://gateway_runtime:...`
   - `DATABASE_URL_ADMIN`: `postgres://platform_admin:...`

3. Run the seed:
   ```bash
   bun run seed:routes
   ```
