import { text, boolean, timestamp, uuid, unique, pgSchema } from 'drizzle-orm/pg-core';
import { type InferSelectModel } from 'drizzle-orm';

export const platformSchema = pgSchema('platform');

export const platformRoutes = platformSchema.table('routes', {
  id: uuid('id').defaultRandom().primaryKey(),
  method: text('method').notNull(),
  pathPattern: text('path_pattern').notNull(),
  serviceKey: text('service_key').notNull(),
  actionKey: text('action_key').notNull(),
  workspaceScoped: boolean('workspace_scoped').notNull().default(true),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    uniqueRoute: unique('platform_routes_method_path_pattern_unique').on(table.method, table.pathPattern)
  }
});

export type PlatformRoute = InferSelectModel<typeof platformRoutes>;
