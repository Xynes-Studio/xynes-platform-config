ALTER TABLE "platform"."workspace_invites"
	ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
