import { describe, expect, it } from 'bun:test';

import {
  normalizeRouteSeed,
  runSeedRoutes,
  verifyTargetPathColumnExists,
} from '../scripts/seedRoutes';
import type { RouteSeed } from '../src/seeds/routes';

type MockTx = {
  insert: (table: unknown) => {
    values: (values: Record<string, unknown>) => {
      onConflictDoUpdate: (args: {
        target: unknown;
        set: Record<string, unknown>;
      }) => Promise<void>;
    };
  };
};

type MockDb = {
  execute: (query: unknown) => Promise<unknown>;
  transaction: <T>(fn: (tx: MockTx) => Promise<T>) => Promise<T>;
};

describe('seedRoutes script utilities', () => {
  it('normalizeRouteSeed defaults targetPath to pathPattern', () => {
    const seed: RouteSeed = {
      method: 'GET',
      pathPattern: '/workspaces/:workspaceId/items',
      serviceKey: 'cms-core',
      actionKey: 'cms.items.list',
      workspaceScoped: true,
      isPublic: false,
    };

    expect(normalizeRouteSeed(seed).targetPath).toBe(seed.pathPattern);
  });

  it('normalizeRouteSeed preserves explicit targetPath override', () => {
    const seed: RouteSeed = {
      method: 'GET',
      pathPattern: '/legacy/path/:id',
      targetPath: '/internal/new-path/:id',
      serviceKey: 'doc-service',
      actionKey: 'docs.document.read',
      workspaceScoped: true,
      isPublic: false,
    };

    expect(normalizeRouteSeed(seed).targetPath).toBe('/internal/new-path/:id');
  });

  it('verifyTargetPathColumnExists passes when information schema returns exists=true', async () => {
    const db: MockDb = {
      execute: async () => [{ exists: true }],
      transaction: async (fn) =>
        fn({
          insert: () => ({
            values: () => ({
              onConflictDoUpdate: async () => {},
            }),
          }),
        }),
    };

    await expect(verifyTargetPathColumnExists(db)).resolves.toBeUndefined();
  });

  it('verifyTargetPathColumnExists throws clear error when column is missing', async () => {
    const db: MockDb = {
      execute: async () => [{ exists: false }],
      transaction: async (fn) =>
        fn({
          insert: () => ({
            values: () => ({
              onConflictDoUpdate: async () => {},
            }),
          }),
        }),
    };

    await expect(verifyTargetPathColumnExists(db)).rejects.toThrow(
      'target_path',
    );
  });

  it('runSeedRoutes uses explicit targetPath override and default targetPath fallback', async () => {
    const capturedValues: Array<Record<string, unknown>> = [];

    const db: MockDb = {
      execute: async () => [{ exists: true }],
      transaction: async (fn) =>
        fn({
          insert: () => ({
            values: (values: Record<string, unknown>) => {
              capturedValues.push(values);
              return {
                onConflictDoUpdate: async () => {},
              };
            },
          }),
        }),
    };

    const seeds: RouteSeed[] = [
      {
        method: 'GET',
        pathPattern: '/a/:id',
        targetPath: '/internal/a/:id',
        serviceKey: 'doc-service',
        actionKey: 'docs.document.read',
        workspaceScoped: true,
        isPublic: false,
      },
      {
        method: 'POST',
        pathPattern: '/b',
        serviceKey: 'accounts-service',
        actionKey: 'accounts.workspaces.create',
        workspaceScoped: false,
        isPublic: false,
      },
    ];

    await runSeedRoutes(db, seeds);

    expect(capturedValues[0]?.targetPath).toBe('/internal/a/:id');
    expect(capturedValues[1]?.targetPath).toBe('/b');
  });
});
