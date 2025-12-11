CREATE SCHEMA "platform";
--> statement-breakpoint
CREATE TABLE "platform"."routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"method" text NOT NULL,
	"path_pattern" text NOT NULL,
	"service_key" text NOT NULL,
	"target_path" text NOT NULL,
	"action_key" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"workspace_scoped" boolean DEFAULT true NOT NULL,
	CONSTRAINT "routes_method_path_pattern_unique" UNIQUE("method","path_pattern")
);
