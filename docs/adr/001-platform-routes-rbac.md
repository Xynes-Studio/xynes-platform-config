# ADR-001: Platform Routes RBAC - Privileged Auth Policy

## Status

Accepted

## Context

The `platform.routes` table defines the routing policy for the API gateway, including which endpoints are public vs. protected. This makes it a **security-critical** data store because:

1. If `is_public` is flipped from `false` to `true`, a private action becomes publicly accessible
2. If `action_key` mappings are modified, requests could be routed to unintended services
3. Runtime application code should never need to modify routes

Without access controls, if gateway DB credentials were compromised (via app vulnerability, log exposure, etc.), an attacker could modify routing policies at runtime.

## Decision

We implement **database role-based access control (RBAC)** with two distinct roles:

### Gateway Runtime Role (`gateway_runtime`)

- **Purpose**: Used by the gateway service at runtime
- **Permissions**: SELECT only on `platform.routes`
- **Rationale**: Gateway needs to read route definitions but never modify them

### Platform Admin Role (`platform_admin`)

- **Purpose**: Used for migrations, seeds, and administrative tooling
- **Permissions**: SELECT, INSERT, UPDATE, DELETE on `platform.routes`
- **Rationale**: Route changes should only happen through controlled, version-controlled processes

### Permission Matrix

| Operation | `gateway_runtime` | `platform_admin` |
|-----------|------------------|------------------|
| SELECT    | ✅               | ✅               |
| INSERT    | ❌               | ✅               |
| UPDATE    | ❌               | ✅               |
| DELETE    | ❌               | ✅               |

## Implementation

### Migration (0003_platform_routes_rbac.sql)

```sql
-- Create roles with random initial passwords (no secrets in git!)
EXECUTE format('CREATE ROLE gateway_runtime WITH LOGIN PASSWORD %L', gen_random_uuid()::text);
EXECUTE format('CREATE ROLE platform_admin WITH LOGIN PASSWORD %L', gen_random_uuid()::text);

-- Post-migration: Set proper passwords
-- ALTER ROLE gateway_runtime WITH PASSWORD 'secure-password';
-- ALTER ROLE platform_admin WITH PASSWORD 'secure-password';

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA platform TO gateway_runtime;
GRANT SELECT ON platform.routes TO gateway_runtime;

GRANT USAGE ON SCHEMA platform TO platform_admin;
GRANT ALL ON platform.routes TO platform_admin;

-- Revoke public access
REVOKE ALL ON platform.routes FROM PUBLIC;
```

### Environment Configuration

| Variable | Role | Usage |
|----------|------|-------|
| `DATABASE_URL` | `gateway_runtime` | Runtime gateway operations |
| `DATABASE_URL_ADMIN` | `platform_admin` | Migrations, seeds |

## Consequences

### Positive

- **Defense in depth**: Even if app credentials leak, routes cannot be modified
- **Audit trail**: All route changes must go through version-controlled migrations
- **Least privilege**: Services only have the permissions they need

### Negative

- **Operational complexity**: Two sets of credentials to manage
- **Migration dependency**: RBAC migration must be applied before new credential model works

### Risks

- **Credential management**: Both credentials need secure storage
- **Backwards compatibility**: Existing deployments need credential rotation
- **Supabase pooler limitation**: Custom roles (`gateway_runtime`, `platform_admin`) cannot connect via Supabase's connection pooler. Only `postgres`-prefixed users work. For testing and migrations, use the postgres superuser connection.

## Testing

Integration tests verify:
- `gateway_runtime` can SELECT from `platform.routes`
- `gateway_runtime` cannot INSERT/UPDATE/DELETE (permission denied)
- `platform_admin` has full CRUD access

## References

- [SECURITY_MODEL.md](file:///Users/archanray/xynes/xynes-infra/infra/SECURITY_MODEL.md)
- [SEC-PLATFORM-ROUTES-1 Story]
