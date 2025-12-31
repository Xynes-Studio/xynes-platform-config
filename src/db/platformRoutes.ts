import {
  text,
  boolean,
  timestamp,
  uuid,
  unique,
  pgSchema,
  integer,
  check,
} from "drizzle-orm/pg-core";
import { type InferSelectModel } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const platformSchema = pgSchema("platform");

/**
 * Default body size limit in bytes (1 MB).
 * SEC-BODYLIMIT-1: Safe default for routes without explicit configuration.
 */
export const DEFAULT_MAX_BODY_BYTES = 1_048_576; // 1 MB

export const platformRoutes = platformSchema.table(
  "routes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    method: text("method").notNull(),
    pathPattern: text("path_pattern").notNull(),
    serviceKey: text("service_key").notNull(),
    actionKey: text("action_key").notNull(),
    workspaceScoped: boolean("workspace_scoped").notNull().default(true),
    isPublic: boolean("is_public").notNull().default(false),
    /**
     * SEC-BODYLIMIT-1: Maximum allowed request body size in bytes.
     * NULL means use the default (1 MB).
     * Set to 0 to reject all bodies (useful for GET-only routes).
     */
    maxBodyBytes: integer("max_body_bytes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("platform_routes_method_path_pattern_unique").on(
      table.method,
      table.pathPattern
    ),
    // Ensure max_body_bytes is non-negative when set
    check(
      "max_body_bytes_non_negative",
      sql`${table.maxBodyBytes} IS NULL OR ${table.maxBodyBytes} >= 0`
    ),
  ]
);

export type PlatformRoute = InferSelectModel<typeof platformRoutes>;
