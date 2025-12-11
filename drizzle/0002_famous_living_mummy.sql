ALTER TABLE "platform"."routes" DROP CONSTRAINT "routes_method_path_pattern_unique";--> statement-breakpoint
ALTER TABLE "platform"."routes" ADD COLUMN "created_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "platform"."routes" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "platform"."routes" ADD CONSTRAINT "platform_routes_method_path_pattern_unique" UNIQUE("method","path_pattern");