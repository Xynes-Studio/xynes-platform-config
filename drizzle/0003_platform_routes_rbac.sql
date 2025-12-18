-- SEC-PLATFORM-ROUTES-1: Treat platform.routes as auth policy
-- This migration creates database roles with appropriate permissions:
-- - gateway_runtime: SELECT-only access for runtime operations
-- - platform_admin: Full access for migrations/seeds

-- ============================================================================
-- SECURITY: Password Management
-- ============================================================================
-- Roles are created with RANDOM passwords (using gen_random_uuid).
-- After running this migration, you MUST set proper passwords:
--
--   ALTER ROLE gateway_runtime WITH PASSWORD 'your-secure-password-here';
--   ALTER ROLE platform_admin WITH PASSWORD 'your-secure-password-here';
--
-- Store credentials securely (e.g., secrets manager, env vars).
-- Never commit actual passwords to version control.
-- ============================================================================

-- Step 1: Create roles if they don't exist (with random initial passwords)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'gateway_runtime') THEN
        EXECUTE format('CREATE ROLE gateway_runtime WITH LOGIN PASSWORD %L', gen_random_uuid()::text);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'platform_admin') THEN
        EXECUTE format('CREATE ROLE platform_admin WITH LOGIN PASSWORD %L', gen_random_uuid()::text);
    END IF;
END
$$;

-- Step 2: Grant schema usage to both roles
GRANT USAGE ON SCHEMA platform TO gateway_runtime;
GRANT USAGE ON SCHEMA platform TO platform_admin;

-- Step 3: Gateway runtime - SELECT only on platform.routes
-- This ensures the gateway can read routes but cannot modify them at runtime
GRANT SELECT ON platform.routes TO gateway_runtime;

-- Step 4: Platform admin - Full access for migrations/seeds
-- This role is used for administrative operations only
GRANT SELECT, INSERT, UPDATE, DELETE ON platform.routes TO platform_admin;

-- Step 5: Revoke default public access to ensure explicit permission control
REVOKE ALL ON platform.routes FROM PUBLIC;

-- Step 6: Ensure sequences are accessible for admin (for id generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA platform TO platform_admin;

-- Verify: The gateway_runtime user should now only be able to SELECT
-- Any INSERT/UPDATE/DELETE attempts will fail with permission denied
