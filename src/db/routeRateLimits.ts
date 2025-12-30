import {
  text,
  boolean,
  timestamp,
  uuid,
  numeric,
  integer,
} from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { platformRoutes, platformSchema } from "./platformRoutes";

/**
 * Rate limit bucket types for determining the rate limit key.
 * - 'ip': Rate limit by client IP address
 * - 'workspace': Rate limit by workspace ID
 * - 'user': Rate limit by authenticated user ID
 * - 'ip+workspace': Rate limit by combination of IP and workspace
 * - 'ip+user': Rate limit by combination of IP and user
 */
export const BUCKET_TYPES = [
  "ip",
  "workspace",
  "user",
  "ip+workspace",
  "ip+user",
] as const;
export type BucketType = (typeof BUCKET_TYPES)[number];

/**
 * Route rate limits table for dynamic rate limiting configuration.
 * Each route can have one rate limit configuration.
 *
 * Security considerations:
 * - limit_count and window_sec must be positive integers
 * - burst_factor must be >= 1.0
 * - enabled flag allows disabling rate limits without deletion
 */
export const routeRateLimits = platformSchema.table("route_rate_limits", {
  id: uuid("id").defaultRandom().primaryKey(),
  routeId: uuid("route_id")
    .notNull()
    .references(() => platformRoutes.id, { onDelete: "cascade" })
    .unique(),
  bucketType: text("bucket_type").notNull().$type<BucketType>(),
  limitCount: integer("limit_count").notNull(),
  windowSec: integer("window_sec").notNull(),
  burstFactor: numeric("burst_factor").notNull().default("1.0"),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type RouteRateLimit = InferSelectModel<typeof routeRateLimits>;
export type NewRouteRateLimit = InferInsertModel<typeof routeRateLimits>;

/**
 * Type guard for validating bucket type strings
 */
export function isValidBucketType(value: string): value is BucketType {
  return BUCKET_TYPES.includes(value as BucketType);
}
