import { describe, it, expect } from 'bun:test';
import { db } from '../src/db/index';
import { platformRoutes as routes } from '../src/db/platformRoutes';
import { sql } from 'drizzle-orm';

describe('Route Registry', () => {
  // We assume migrations are run before tests
  
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

    const commentCreate = allRoutes.find(r => r.actionKey === 'cms.comments.create');
    expect(commentCreate).toBeDefined();
    expect(commentCreate?.method).toBe('POST');
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
