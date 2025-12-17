import { db } from '../src/db';
import { platformRoutes } from '../src/db/platformRoutes';
import { routeSeeds } from '../src/seeds/routes';

const main = async () => {
  console.log('Seeding routes...');
  try {
    await db.insert(platformRoutes).values(routeSeeds).onConflictDoNothing();
    console.log('Routes seeded successfully');
  } catch (error) {
    console.error('Error seeding routes:', error);
    process.exit(1);
  }
  process.exit(0);
};

main();
