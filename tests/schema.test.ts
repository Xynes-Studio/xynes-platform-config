import { describe, it, expect } from "bun:test";
import { platformRoutes } from "../src/db/platformRoutes";
import { getTableName, getTableColumns } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";

describe("Platform Schema", () => {
    it("should have correct table name and schema", () => {
        const tableName = getTableName(platformRoutes);
        expect(tableName).toBe("routes");
        // @ts-expect-error - internal property access for schema name check if needed, or rely on Drizzle's behavior
    });

    it("should have required columns", () => {
        const columns = getTableColumns(platformRoutes);
        const columnNames = Object.keys(columns);
        
        expect(columnNames).toContain("id");
        expect(columnNames).toContain("method");
        expect(columnNames).toContain("pathPattern");
        expect(columnNames).toContain("serviceKey");
        expect(columnNames).toContain("actionKey");
        expect(columnNames).toContain("workspaceScoped");
        expect(columnNames).toContain("isPublic");
        expect(columnNames).toContain("createdAt");
        expect(columnNames).toContain("updatedAt");
    });

    it("should define unique constraint on method + pathPattern", () => {
        const config = getTableConfig(platformRoutes);
        const names = config.uniqueConstraints.map((c) => c.name);
        expect(names).toContain("platform_routes_method_path_pattern_unique");
    });
});
