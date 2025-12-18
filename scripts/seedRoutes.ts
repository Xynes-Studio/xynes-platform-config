/**
 * Route Seeder Script
 * 
 * Seeds the platform.routes table with initial route configurations.
 * 
 * Security Note:
 * This script uses admin database credentials (DATABASE_URL_ADMIN)
 * because the gateway_runtime user has SELECT-only access.
 * 
 * Usage:
 *   DATABASE_URL_ADMIN="postgres://platform_admin:..." bun run seed:routes
 */
import { adminDb } from '../src/db/admin';
import { platformRoutes } from '../src/db/platformRoutes';
import { routeSeeds } from '../src/seeds/routes';

const main = async () => {
  console.log('Seeding routes using admin credentials...');
  console.log(`Routes to seed: ${routeSeeds.length}`);

  try {
    const result = await adminDb.insert(platformRoutes).values(routeSeeds).onConflictDoNothing();
    console.log('Routes seeded successfully');
    console.log('Note: Existing routes were preserved (onConflictDoNothing)');
  } catch (error) {
    console.error('Error seeding routes:', error);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Ensure DATABASE_URL_ADMIN is set with platform_admin credentials');
    console.error('2. Ensure the RBAC migration (0003) has been applied');
    console.error('3. Check that the database is accessible');
    process.exit(1);
  }
  process.exit(0);
};

main();

