CREATE TABLE "platform"."workspace_invites" (
	"id" uuid PRIMARY KEY NOT NULL,
	"workspace_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role_key" text NOT NULL,
	"invited_by" uuid NOT NULL,
	"token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamptz NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "platform"."workspace_invites"
	ADD CONSTRAINT "workspace_invites_workspace_id_workspaces_id_fk"
	FOREIGN KEY ("workspace_id") REFERENCES "platform"."workspaces"("id");
--> statement-breakpoint
ALTER TABLE "platform"."workspace_invites"
	ADD CONSTRAINT "workspace_invites_role_key_roles_key_fk"
	FOREIGN KEY ("role_key") REFERENCES "authz"."roles"("key");
--> statement-breakpoint
ALTER TABLE "platform"."workspace_invites"
	ADD CONSTRAINT "workspace_invites_invited_by_users_id_fk"
	FOREIGN KEY ("invited_by") REFERENCES "identity"."users"("id");
