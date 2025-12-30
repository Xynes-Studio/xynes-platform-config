import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as platformRoutesSchema from "./platformRoutes";
import * as routeRateLimitsSchema from "./routeRateLimits";

// Combine all schemas
const schema = {
  ...platformRoutesSchema,
  ...routeRateLimitsSchema,
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

// Re-export all schema types and tables
export * from "./platformRoutes";
export * from "./routeRateLimits";
