# Xynes Platform Config

Tiny service for platform configuration and route registry.

## Tech Stack
- **Runtime**: Bun
- **Framework**: Hono
- **ORM**: Drizzle
- **DB**: PostgreSQL (Supabase)

## Getting Started

1.  **Install Dependencies**
    ```bash
    bun install
    ```

2.  **Environment**
    Copy `.env.example` to `.env` and set `DATABASE_URL`.
    ```bash
    cp .env.example .env
    ```

3.  **Run Migrations**
    ```bash
    bun run db:migrate
    ```

## Database Schema

### `platform.routes`
- **id**: UUID (PK)
- **method**: HTTP Method (GET, POST, etc.)
- **path_pattern**: External path pattern (e.g., `/api/v1/users`)
- **service_key**: Upstream service identifier
- **target_path**: Internal path pattern
- **action_key**: Permission/Action identifier
- **is_public**: Boolean
- **workspace_scoped**: Boolean

**Constraints**: Unique on `(method, path_pattern)`

4.  **Seed Data**
    ```bash
    bun run seed
    ```

5.  **Development**
    ```bash
    bun run dev
    ```

## Testing
Run integration tests:
```bash
bun test
```
