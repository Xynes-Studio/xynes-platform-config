import { db } from '../src/db';
import { platformRoutes } from '../src/db/platformRoutes';

const main = async () => {
  console.log('Seeding routes...');
  try {
    await db.insert(platformRoutes).values([
      {
        method: 'POST',
        pathPattern: '/workspaces/:workspaceId/documents',
        serviceKey: 'doc-service',
        actionKey: 'docs.document.create',
        workspaceScoped: true,
        isPublic: false
      },
      {
        method: 'GET',
        pathPattern: '/workspaces/:workspaceId/documents/:id',
        serviceKey: 'doc-service',
        actionKey: 'docs.document.read',
        workspaceScoped: true,
        isPublic: false
      },
      // Blog Routes
      {
        method: 'GET',
        pathPattern: '/workspaces/:workspaceId/blog',
        serviceKey: 'cms-core',
        actionKey: 'cms.blog_entry.listPublished',
        workspaceScoped: true,
        isPublic: true
      },
      {
        method: 'GET',
        pathPattern: '/workspaces/:workspaceId/blog/:slug',
        serviceKey: 'cms-core',
        actionKey: 'cms.blog_entry.getPublishedBySlug',
        workspaceScoped: true,
        isPublic: true
      },
      // Comment Routes
      {
        method: 'POST',
        pathPattern: '/workspaces/:workspaceId/content-entries/:entryId/comments',
        serviceKey: 'cms-core',
        actionKey: 'cms.comments.create',
        workspaceScoped: true,
        isPublic: true
      },
      {
        method: 'GET',
        pathPattern: '/workspaces/:workspaceId/content-entries/:entryId/comments',
        serviceKey: 'cms-core',
        actionKey: 'cms.comments.listForEntry',
        workspaceScoped: true,
        isPublic: true
      }
    ]).onConflictDoNothing();
    console.log('Routes seeded successfully');
  } catch (error) {
    console.error('Error seeding routes:', error);
    process.exit(1);
  }
  process.exit(0);
};

main();
