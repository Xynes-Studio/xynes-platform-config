import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import postgres from 'postgres';

/**
 * RBAC Verification Tests for platform.routes
 * 
 * Verifies permissions via system catalogs (metadata) because connecting
 * to Supabase pooler with custom roles created via SQL is restricted.
 * 
 * Prerequisites:
 * - RBAC migration (0003_platform_routes_rbac.sql) must be applied
 * - DATABASE_URL must be available (admin/postgres connection)
 */

describe('Platform Routes RBAC (Metadata Verification)', () => {
    let client: ReturnType<typeof postgres>;

    beforeAll(async () => {
        // Use the working admin connection
        // We try DATABASE_URL_ADMIN first, but fallback to DATABASE_URL which we know works
        const connectionString = process.env.DATABASE_URL_ADMIN || process.env.DATABASE_URL;

        if (!connectionString) {
            console.warn('Skipping RBAC tests: No DATABASE_URL provided');
            return;
        }

        client = postgres(connectionString, { prepare: false, max: 1 });
    });

    afterAll(async () => {
        if (client) {
            await client.end({ timeout: 2 });
        }
    });

    // Skip tests if client isn't set up
    const runIfClient = process.env.DATABASE_URL ? it : it.skip;

    runIfClient('roles should exist in database', async () => {
        const roles = await client`
      SELECT rolname FROM pg_roles 
      WHERE rolname IN ('gateway_runtime', 'platform_admin')
    `;
        expect(roles).toHaveLength(2);
        const roleNames = roles.map(r => r.rolname).sort();
        expect(roleNames).toEqual(['gateway_runtime', 'platform_admin']);
    });

    describe('gateway_runtime permissions', () => {
        runIfClient('should have SELECT privilege', async () => {
            const [result] = await client`
        SELECT has_table_privilege('gateway_runtime', 'platform.routes', 'SELECT') as allowed
      `;
            expect(result.allowed).toBe(true);
        });

        runIfClient('should NOT have INSERT privilege', async () => {
            const [result] = await client`
        SELECT has_table_privilege('gateway_runtime', 'platform.routes', 'INSERT') as allowed
      `;
            expect(result.allowed).toBe(false);
        });

        runIfClient('should NOT have UPDATE privilege', async () => {
            const [result] = await client`
        SELECT has_table_privilege('gateway_runtime', 'platform.routes', 'UPDATE') as allowed
      `;
            expect(result.allowed).toBe(false);
        });

        runIfClient('should NOT have DELETE privilege', async () => {
            const [result] = await client`
        SELECT has_table_privilege('gateway_runtime', 'platform.routes', 'DELETE') as allowed
      `;
            expect(result.allowed).toBe(false);
        });
    });

    describe('platform_admin permissions', () => {
        runIfClient('should have ALL privileges', async () => {
            const [select] = await client`SELECT has_table_privilege('platform_admin', 'platform.routes', 'SELECT') as allowed`;
            const [insert] = await client`SELECT has_table_privilege('platform_admin', 'platform.routes', 'INSERT') as allowed`;
            const [update] = await client`SELECT has_table_privilege('platform_admin', 'platform.routes', 'UPDATE') as allowed`;
            const [_delete] = await client`SELECT has_table_privilege('platform_admin', 'platform.routes', 'DELETE') as allowed`;

            expect(select.allowed).toBe(true);
            expect(insert.allowed).toBe(true);
            expect(update.allowed).toBe(true);
            expect(_delete.allowed).toBe(true);
        });
    });
});
