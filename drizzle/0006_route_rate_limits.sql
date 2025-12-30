CREATE TABLE "platform"."route_rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid NOT NULL,
	"bucket_type" text NOT NULL,
	"limit_count" integer NOT NULL,
	"window_sec" integer NOT NULL,
	"burst_factor" numeric DEFAULT '1.0' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "route_rate_limits_route_id_unique" UNIQUE("route_id"),
	CONSTRAINT "bucket_type_check" CHECK ("platform"."route_rate_limits"."bucket_type" IN ('ip', 'workspace', 'user', 'ip+workspace', 'ip+user')),
	CONSTRAINT "limit_count_positive" CHECK ("platform"."route_rate_limits"."limit_count" > 0),
	CONSTRAINT "window_sec_positive" CHECK ("platform"."route_rate_limits"."window_sec" > 0),
	CONSTRAINT "burst_factor_min" CHECK ("platform"."route_rate_limits"."burst_factor"::numeric >= 1.0)
);
--> statement-breakpoint
ALTER TABLE "platform"."route_rate_limits" ADD CONSTRAINT "route_rate_limits_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "platform"."routes"("id") ON DELETE cascade ON UPDATE no action;