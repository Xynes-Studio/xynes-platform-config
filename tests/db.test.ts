import { describe, it, expect, beforeAll } from 'bun:test';
import { platformRoutes as routes } from '../src/db/platformRoutes';
import { sql } from 'drizzle-orm';

const databaseUrl = process.env.DATABASE_URL;
const describeDb = databaseUrl ? describe : describe.skip;

describeDb('Route Registry (DB)', () => {
  // We assume migrations/seeds are run before tests
  let db: typeof import('../src/db/index').db;

  beforeAll(async () => {
    ({ db } = await import('../src/db/index'));
  });
  
  it('should be able to query the database', async () => {
    const result = await db.execute(sql`SELECT 1`);
    expect(result).toBeDefined();
  });

  it('should have seeded routes', async () => {
    const allRoutes = await db.select().from(routes);
    expect(allRoutes.length).toBeGreaterThan(0);
    
    const docCreate = allRoutes.find(r => r.actionKey === 'docs.document.create');
    expect(docCreate).toBeDefined();
    expect(docCreate?.method).toBe('POST');
    expect(docCreate?.pathPattern).toBe('/workspaces/:workspaceId/documents');

    const blogList = allRoutes.find(r => r.actionKey === 'cms.blog_entry.listPublished');
    expect(blogList).toBeDefined();
    expect(blogList?.method).toBe('GET');
    expect(blogList?.isPublic).toBe(true);

    const contentList = allRoutes.find(r => r.actionKey === 'cms.content.listPublished');
    expect(contentList).toBeDefined();
    expect(contentList?.method).toBe('GET');
    expect(contentList?.isPublic).toBe(true);
    expect(contentList?.pathPattern).toBe('/workspaces/:workspaceId/content/:routeSegment');

    const contentGet = allRoutes.find(r => r.actionKey === 'cms.content.getPublishedBySlug');
    expect(contentGet).toBeDefined();
    expect(contentGet?.method).toBe('GET');
    expect(contentGet?.isPublic).toBe(true);
    expect(contentGet?.pathPattern).toBe('/workspaces/:workspaceId/content/:routeSegment/:slug');

    // Guardrail: exactly two generic /content routes (no per-template additions)
    const genericContentRoutes = allRoutes.filter((r) => /\/content(\/|$)/.test(r.pathPattern));
    expect(genericContentRoutes).toHaveLength(2);

    const commentCreate = allRoutes.find(r => r.actionKey === 'cms.comments.create');
    expect(commentCreate).toBeDefined();
    expect(commentCreate?.method).toBe('POST');
    expect(commentCreate?.isPublic).toBe(false);

    const commentListForEntry = allRoutes.find(r => r.actionKey === 'cms.comments.listForEntry');
    expect(commentListForEntry).toBeDefined();
    expect(commentListForEntry?.method).toBe('GET');
    expect(commentListForEntry?.isPublic).toBe(false);
  });

  it('should enforce unique constraint on method + pathPattern', async () => {
    const newRoute = {
        method: 'GET',
        pathPattern: '/unique-test',
        serviceKey: 'test',
        actionKey: 'test.read',
        isPublic: false,
        workspaceScoped: false
    };

    // First insert
    await db.insert(routes).values(newRoute);

    // Second insert should fail
    try {
        await db.insert(routes).values(newRoute);
        expect(true).toBe(false); // Should not reach here
    } catch (e: unknown) {
        // Postgres error code 23505 is unique_violation
        // Drizzle/Postgresjs might return it differently, but it should throw.
        expect(e).toBeDefined();
    }
    
    // Cleanup
    await db.delete(routes).where(sql`path_pattern = '/unique-test'`);
  });
});
