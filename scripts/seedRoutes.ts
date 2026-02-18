/**
 * Route Seeder Script
 *
 * Seeds the platform.routes table with source-of-truth route configurations.
 *
 * Security Note:
 * This script uses admin database credentials (DATABASE_URL_ADMIN)
 * because the gateway_runtime user has SELECT-only access.
 *
 * Usage:
 *   DATABASE_URL_ADMIN="postgres://platform_admin:..." bun run seed:routes
 */
import { sql } from 'drizzle-orm';
import { platformRoutes } from '../src/db/platformRoutes';
import { routeSeeds, type RouteSeed } from '../src/seeds/routes';

type SeedDb = {
  execute: (query: unknown) => Promise<unknown>;
  transaction: <T>(fn: (tx: SeedTx) => Promise<T>) => Promise<T>;
};

type SeedTx = {
  insert: (table: typeof platformRoutes) => {
    values: (values: Record<string, unknown>) => {
      onConflictDoUpdate: (args: {
        target: unknown;
        set: Record<string, unknown>;
      }) => Promise<unknown>;
    };
  };
};

const MISSING_TARGET_PATH_COLUMN_ERROR =
  'Missing required column platform.routes.target_path. Run platform migrations before seed:routes.';

function getExistsFlag(result: unknown): boolean {
  const rows = Array.isArray(result)
    ? result
    : typeof result === 'object' && result !== null && 'rows' in result
      ? ((result as { rows?: unknown }).rows ?? [])
      : [];

  if (!Array.isArray(rows) || rows.length === 0) return false;
  const firstRow = rows[0] as { exists?: unknown };
  const exists = firstRow?.exists;
  return exists === true || exists === 't' || exists === 'true' || exists === 1;
}

export function normalizeRouteSeed(route: RouteSeed): RouteSeed & { targetPath: string } {
  return {
    ...route,
    targetPath: route.targetPath ?? route.pathPattern,
  };
}

async function getDefaultAdminDb(): Promise<SeedDb> {
  const { adminDb } = await import('../src/db/admin');
  return adminDb as unknown as SeedDb;
}

export async function verifyTargetPathColumnExists(db: SeedDb): Promise<void> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'platform'
        AND table_name = 'routes'
        AND column_name = 'target_path'
    ) AS exists
  `);

  if (!getExistsFlag(result)) {
    throw new Error(MISSING_TARGET_PATH_COLUMN_ERROR);
  }
}

export async function runSeedRoutes(
  db?: SeedDb,
  seeds: RouteSeed[] = routeSeeds,
): Promise<void> {
  const targetDb = db ?? (await getDefaultAdminDb());

  await verifyTargetPathColumnExists(targetDb);

  await targetDb.transaction(async (tx) => {
    for (const route of seeds) {
      const normalizedRoute = normalizeRouteSeed(route);

      await tx.insert(platformRoutes).values(normalizedRoute).onConflictDoUpdate({
        target: [platformRoutes.method, platformRoutes.pathPattern],
        set: {
          ...normalizedRoute,
          updatedAt: new Date(),
        },
      });
    }
  });
}

export async function main(): Promise<void> {
  console.log('Seeding routes using admin credentials...');
  console.log(`Routes to seed: ${routeSeeds.length}`);

  try {
    await runSeedRoutes();
    console.log('Routes seeded successfully');
    console.log('Applied as upsert to prevent route drift.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding routes:', error);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Ensure DATABASE_URL_ADMIN is set with platform_admin credentials');
    console.error('2. Ensure platform.routes includes required target_path column');
    console.error('3. Check that the database is accessible');
    process.exit(1);
  }
}

if (import.meta.main) {
  void main();
}
