import { runSeedRoutes } from '../../scripts/seedRoutes';

async function main() {
  console.warn('[DEPRECATED] src/scripts/seed.ts is deprecated. Use `bun run seed:routes`.');
  await runSeedRoutes();
  console.log('Seeding complete!');
  process.exit(0);
}

if (import.meta.main) {
  void main().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}
