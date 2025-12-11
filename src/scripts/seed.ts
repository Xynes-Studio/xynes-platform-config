import { db } from '../db/index';
import { routes } from '../db/schema';

const seedData = [
  // Documents
  {
    method: 'POST',
    pathPattern: '/workspaces/:workspaceId/documents',
    serviceKey: 'doc-service',
    actionKey: 'docs.document.create',
    workspaceScoped: true,
  },
  {
    method: 'GET',
    pathPattern: '/workspaces/:workspaceId/documents/:id',
    serviceKey: 'doc-service',
    actionKey: 'docs.document.read',
    workspaceScoped: true,
  },
  // Blog entries
  {
    method: 'POST',
    pathPattern: '/workspaces/:workspaceId/content-types/:contentTypeId/entries',
    serviceKey: 'cms-core',
    actionKey: 'cms.blog_entry.create',
    workspaceScoped: true, // Assuming this, as it has workspaceId in path
  },
  {
    method: 'GET',
    pathPattern: '/workspaces/:workspaceId/content-types/:contentTypeId/entries',
    serviceKey: 'cms-core',
    actionKey: 'cms.blog_entry.read',
    workspaceScoped: true,
  },
];

async function main() {
  console.log('Seeding routes...');
  
  for (const route of seedData) {
    await db.insert(routes)
      .values(route)
      .onConflictDoUpdate({
        target: [routes.method, routes.pathPattern],
        set: route,
      });
  }

  console.log('Seeding complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
