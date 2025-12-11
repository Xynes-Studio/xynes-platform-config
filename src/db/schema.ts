import { pgSchema, uuid, text, boolean, unique } from 'drizzle-orm/pg-core';

export const platformSchema = pgSchema('platform');

export const routes = platformSchema.table('routes', {
  id: uuid('id').defaultRandom().primaryKey(),
  method: text('method').notNull(),
  pathPattern: text('path_pattern').notNull(),
  serviceKey: text('service_key').notNull(),
  targetPath: text('target_path').notNull(),
  actionKey: text('action_key').notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  workspaceScoped: boolean('workspace_scoped').default(true).notNull(),
}, (t) => ({
  unq: unique().on(t.method, t.pathPattern),
}));
