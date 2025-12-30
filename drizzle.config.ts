import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./src/db/platformRoutes.ts", "./src/db/routeRateLimits.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ["platform"],
});
