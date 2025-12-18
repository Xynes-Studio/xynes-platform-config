/**
 * Admin Database Connection
 * 
 * This module provides a database connection with elevated privileges
 * for administrative operations like migrations and seeding.
 * 
 * Uses DATABASE_URL_ADMIN environment variable, falling back to DATABASE_URL.
 * 
 * Security Note:
 * - This connection has INSERT/UPDATE/DELETE permissions on platform.routes
 * - Should only be used by migration scripts and admin tooling
 * - Never use in runtime application code
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './platformRoutes';

const getAdminConnectionString = (): string => {
    const adminUrl = process.env.DATABASE_URL_ADMIN;
    const defaultUrl = process.env.DATABASE_URL;

    if (adminUrl) {
        return adminUrl;
    }

    if (defaultUrl) {
        // In production, require explicit admin credentials
        if (process.env.NODE_ENV === 'production') {
            throw new Error(
                'DATABASE_URL_ADMIN is required in production. ' +
                'Admin operations must use platform_admin credentials, not gateway_runtime.'
            );
        }
        console.warn('[WARNING] DATABASE_URL_ADMIN not set, falling back to DATABASE_URL');
        console.warn('[WARNING] In production, ensure admin operations use platform_admin credentials');
        return defaultUrl;
    }

    throw new Error('DATABASE_URL_ADMIN or DATABASE_URL is required for admin operations');
};

const connectionString = getAdminConnectionString();

// Disable prefetch as it is not supported for "Transaction" pool mode
const adminClient = postgres(connectionString, { prepare: false });
export const adminDb = drizzle(adminClient, { schema });
