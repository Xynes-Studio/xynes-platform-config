import { db } from '../db/index';
import { platformRoutes as routes } from '../db/platformRoutes';

const seedData = [
  // Documents
  {
    method: 'POST',
    pathPattern: '/workspaces/:workspaceId/documents',
    targetPath: '/workspaces/:workspaceId/documents',
    serviceKey: 'doc-service',
    actionKey: 'docs.document.create',
    workspaceScoped: true,
  },
  {
    method: 'GET',
    pathPattern: '/workspaces/:workspaceId/documents/:id',
    targetPath: '/workspaces/:workspaceId/documents/:id',
    serviceKey: 'doc-service',
    actionKey: 'docs.document.read',
    workspaceScoped: true,
  },
  // Blog entries
  {
    method: 'POST',
    pathPattern: '/workspaces/:workspaceId/content-types/:contentTypeId/entries',
    targetPath: '/workspaces/:workspaceId/content-types/:contentTypeId/entries',
    serviceKey: 'cms-core',
    actionKey: 'cms.blog_entry.create',
    workspaceScoped: true, // Assuming this, as it has workspaceId in path
  },
  {
    method: 'GET',
    pathPattern: '/workspaces/:workspaceId/content-types/:contentTypeId/entries',
    targetPath: '/workspaces/:workspaceId/content-types/:contentTypeId/entries',
    serviceKey: 'cms-core',
    actionKey: 'cms.blog_entry.read',
    workspaceScoped: true,
  },
  // Public Blog Routes
  {
    method: 'GET',
    pathPattern: '/workspaces/:workspaceId/blog',
    targetPath: '/workspaces/:workspaceId/blog',
    serviceKey: 'cms-core',
    actionKey: 'cms.blog_entry.listPublished',
    workspaceScoped: true,
    isPublic: true,
  },
  {
    method: 'GET',
    pathPattern: '/workspaces/:workspaceId/blog/:slug',
    targetPath: '/workspaces/:workspaceId/blog/:slug',
    serviceKey: 'cms-core',
    actionKey: 'cms.blog_entry.getPublishedBySlug',
    workspaceScoped: true,
    isPublic: true,
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
