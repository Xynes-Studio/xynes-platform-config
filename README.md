# Xynes Platform Config

This repository serves as the central source of truth for the platform's dynamic routing configuration and shared database logic. It is a library and migration tool, not an HTTP service.

## 🎯 Purpose

- **Route Registry**: Defines the `platform.routes` table which maps HTTP paths to internal service actions.
- **Database Schema**: Manages the `platform` schema using Drizzle ORM.
- **Migrations**: Handles database migrations for the platform configuration.

## 🗃️ Data Model

### Platform Routes (`platform.routes`)

| Column | Type | Description |
|ionKey` | `text` | Internal action identifier (e.g., `docs.document.create`) |
| `workspaceScoped` | `boolean` | Whether the route requires a workspace ID (default: `true`) |
| `isPublic` | `boolean` | Whether the route is effectively public (default: `false`) |

### Standard Routes
- **Documents**: `/workspaces/:workspaceId/documents` (POST, GET)
- **Blog**: `/workspaces/:workspaceId/blog` (GET, List/Slug)
- **Comments**: `/workspaces/:workspaceId/.../comments` (POST, GET)


## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh)
- Postgres Database (connection string required)

### Installation

```bash
bun install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgres://user:pass@host:5432/db"
```

## 🛠️ Scripts

- `bun run migrate`: Apply pending migrations to the database.
- `bun run seed:routes`: Seed the database with initial/example routes.
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
│   │   └── index.ts      # Database connection and exports
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

2. Update `DATABASE_URL` in your `.env` to a full Postgres connection string (pointing at the tunnel on `127.0.0.1:5432`), for example:
   ```env
   DATABASE_URL="postgres://postgres.<TENANT_ID>:<POSTGRES_PASSWORD>@127.0.0.1:5432/postgres"
   ```

3. Run the seed:
   ```bash
   bun run seed:routes
   ```
