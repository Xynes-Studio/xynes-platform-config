-- SEC-BODYLIMIT-1: Add max_body_bytes column for request size limits
-- Migration adds a nullable integer column to store per-route body size limits in bytes.
-- NULL means use the gateway default (1 MB).
-- 0 means reject all bodies (useful for GET-only routes).

ALTER TABLE "platform"."routes" ADD COLUMN "max_body_bytes" integer;
--> statement-breakpoint
ALTER TABLE "platform"."routes" ADD CONSTRAINT "max_body_bytes_non_negative" 
  CHECK ("max_body_bytes" IS NULL OR "max_body_bytes" >= 0);

-- Set recommended limits for specific route types:
-- Comments creation: 16 KB (small payloads expected)
-- Telemetry ingest: 64 KB (moderate but bounded)
-- Document creation: 5 MB (larger content allowed)
-- Default for unset routes: 1 MB (handled in application code)

COMMENT ON COLUMN "platform"."routes"."max_body_bytes" IS 
  'SEC-BODYLIMIT-1: Maximum allowed request body size in bytes. NULL = use default (1MB), 0 = reject bodies.';
