import { describe, it, expect } from "bun:test";
import { routeSeeds } from "../src/seeds/routes";

describe("Route Seeds", () => {
  describe("Content Type Metadata Routes", () => {
    it("should expose GET /workspaces/:workspaceId/content-types as auth-required and workspace-scoped", () => {
      const contentTypesRoute = routeSeeds.find(
        (r) =>
          r.pathPattern === "/workspaces/:workspaceId/content-types" &&
          r.method === "GET",
      );

      expect(contentTypesRoute).toBeDefined();
      expect(contentTypesRoute).toEqual(
        expect.objectContaining({
          method: "GET",
          pathPattern: "/workspaces/:workspaceId/content-types",
          serviceKey: "cms-core",
          actionKey: "cms.content_types.listForWorkspace",
          workspaceScoped: true,
          isPublic: false,
        }),
      );
    });
  });

  // GATEWAY-CONTENT-ROUTES-1: Generic Dynamic Public Content Routes
  describe("Generic Content Routes (GATEWAY-CONTENT-ROUTES-1)", () => {
    it("should expose GET /workspaces/:workspaceId/content/:routeSegment as public, workspace-scoped", () => {
      const listRoute = routeSeeds.find(
        (r) =>
          r.pathPattern === "/workspaces/:workspaceId/content/:routeSegment" &&
          r.method === "GET"
      );

      expect(listRoute).toBeDefined();
      expect(listRoute).toEqual(
        expect.objectContaining({
          method: "GET",
          pathPattern: "/workspaces/:workspaceId/content/:routeSegment",
          serviceKey: "cms-core",
          actionKey: "cms.content.listPublished",
          workspaceScoped: true,
          isPublic: true,
        })
      );
    });

    it("should expose GET /workspaces/:workspaceId/content/:routeSegment/:slug as public, workspace-scoped", () => {
      const getBySlugRoute = routeSeeds.find(
        (r) =>
          r.pathPattern ===
            "/workspaces/:workspaceId/content/:routeSegment/:slug" &&
          r.method === "GET"
      );

      expect(getBySlugRoute).toBeDefined();
      expect(getBySlugRoute).toEqual(
        expect.objectContaining({
          method: "GET",
          pathPattern: "/workspaces/:workspaceId/content/:routeSegment/:slug",
          serviceKey: "cms-core",
          actionKey: "cms.content.getPublishedBySlug",
          workspaceScoped: true,
          isPublic: true,
        })
      );
    });

    it("should route generic content requests to cms-core service", () => {
      const contentRoutes = routeSeeds.filter((r) =>
        r.pathPattern.includes("/content/:routeSegment")
      );

      expect(contentRoutes.length).toBeGreaterThanOrEqual(2);
      contentRoutes.forEach((route) => {
        expect(route.serviceKey).toBe("cms-core");
      });
    });

    it("should use :routeSegment as dynamic path param for content type resolution", () => {
      // Acceptance criteria: Adding a new type (e.g. news) requires only
      // CMS content type setup + mapping routeSegment → contentType, not any gateway code change.
      const listRoute = routeSeeds.find(
        (r) => r.actionKey === "cms.content.listPublished"
      );
      const getRoute = routeSeeds.find(
        (r) => r.actionKey === "cms.content.getPublishedBySlug"
      );

      // Both routes should use :routeSegment (typeKey equivalent) for dynamic content type mapping
      expect(listRoute?.pathPattern).toContain(":routeSegment");
      expect(getRoute?.pathPattern).toContain(":routeSegment");
    });

    it("should include exactly two generic content routes (list + getBySlug)", () => {
      const genericContentRoutes = routeSeeds.filter((r) =>
        /\/content(\/|$)/.test(r.pathPattern)
      );

      expect(genericContentRoutes).toHaveLength(2);

      expect(genericContentRoutes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            method: "GET",
            pathPattern: "/workspaces/:workspaceId/content/:routeSegment",
            serviceKey: "cms-core",
            actionKey: "cms.content.listPublished",
            workspaceScoped: true,
            isPublic: true,
          }),
          expect.objectContaining({
            method: "GET",
            pathPattern: "/workspaces/:workspaceId/content/:routeSegment/:slug",
            serviceKey: "cms-core",
            actionKey: "cms.content.getPublishedBySlug",
            workspaceScoped: true,
            isPublic: true,
          }),
        ])
      );
    });
  });

  // CMS-COMMENTS-PUBLIC-1: Public Comment Routes
  describe("Public Comment Routes (CMS-COMMENTS-PUBLIC-1)", () => {
    it("should expose POST /workspaces/:workspaceId/content-entries/:entryId/comments as public for anonymous comment creation", () => {
      const commentCreate = routeSeeds.find(
        (r) => r.actionKey === "cms.comments.create"
      );
      expect(commentCreate).toEqual(
        expect.objectContaining({
          method: "POST",
          pathPattern:
            "/workspaces/:workspaceId/content-entries/:entryId/comments",
          serviceKey: "cms-core",
          actionKey: "cms.comments.create",
          workspaceScoped: true,
          isPublic: true,
        })
      );
    });

    it("should expose GET /workspaces/:workspaceId/content-entries/:entryId/comments as public for listing comments", () => {
      const commentList = routeSeeds.find(
        (r) => r.actionKey === "cms.comments.listForEntry"
      );
      expect(commentList).toEqual(
        expect.objectContaining({
          method: "GET",
          pathPattern:
            "/workspaces/:workspaceId/content-entries/:entryId/comments",
          serviceKey: "cms-core",
          actionKey: "cms.comments.listForEntry",
          workspaceScoped: true,
          isPublic: true,
        })
      );
    });

    it("should route comment requests to cms-core service with workspace scoping", () => {
      const commentRoutes = routeSeeds.filter((r) =>
        r.pathPattern.includes("/content-entries/:entryId/comments")
      );

      expect(commentRoutes).toHaveLength(2);
      commentRoutes.forEach((route) => {
        expect(route.serviceKey).toBe("cms-core");
        expect(route.workspaceScoped).toBe(true);
      });
    });
  });

  it("should seed GET /me as auth-required and not workspace-scoped", () => {
    const meRoute = routeSeeds.find(
      (r) => r.pathPattern === "/me" && r.method === "GET"
    );
    expect(meRoute).toEqual(
      expect.objectContaining({
        serviceKey: "accounts-service",
        actionKey: "accounts.me.getOrCreate",
        workspaceScoped: false,
        isPublic: false,
      })
    );
  });

  it("should seed PATCH /me/profile as auth-required and not workspace-scoped", () => {
    const profileRoute = routeSeeds.find(
      (r) => r.pathPattern === "/me/profile" && r.method === "PATCH"
    );
    expect(profileRoute).toEqual(
      expect.objectContaining({
        serviceKey: "accounts-service",
        actionKey: "accounts.user.updateSelf",
        workspaceScoped: false,
        isPublic: false,
      })
    );
  });

  it("should seed global workspaces routes as auth-required and not workspace-scoped", () => {
    const listRoute = routeSeeds.find(
      (r) => r.pathPattern === "/workspaces" && r.method === "GET"
    );
    expect(listRoute).toEqual(
      expect.objectContaining({
        serviceKey: "accounts-service",
        actionKey: "accounts.workspaces.listForUser",
        workspaceScoped: false,
        isPublic: false,
      })
    );

    const createRoute = routeSeeds.find(
      (r) => r.pathPattern === "/workspaces" && r.method === "POST"
    );
    expect(createRoute).toEqual(
      expect.objectContaining({
        serviceKey: "accounts-service",
        actionKey: "accounts.workspaces.create",
        workspaceScoped: false,
        isPublic: false,
      })
    );
  });

  it("should seed workspace members route as auth-required and workspace-scoped", () => {
    const membersRoute = routeSeeds.find(
      (r) =>
        r.pathPattern === "/workspaces/:workspaceId/members" &&
        r.method === "GET"
    );
    expect(membersRoute).toEqual(
      expect.objectContaining({
        serviceKey: "accounts-service",
        actionKey: "accounts.workspace_members.listForWorkspace",
        workspaceScoped: true,
        isPublic: false,
      })
    );
  });

  it("should seed invite routes with correct public/auth + workspace scoping", () => {
    const createInvite = routeSeeds.find(
      (r) =>
        r.pathPattern === "/workspaces/:workspaceId/invites" &&
        r.method === "POST"
    );
    expect(createInvite).toEqual(
      expect.objectContaining({
        serviceKey: "accounts-service",
        actionKey: "accounts.invites.create",
        workspaceScoped: true,
        isPublic: false,
      })
    );

    const resolveInvite = routeSeeds.find(
      (r) => r.pathPattern === "/workspace-invites/:token" && r.method === "GET"
    );
    expect(resolveInvite).toEqual(
      expect.objectContaining({
        serviceKey: "accounts-service",
        actionKey: "accounts.invites.resolve",
        workspaceScoped: false,
        isPublic: true,
      })
    );

    const acceptInvite = routeSeeds.find(
      (r) =>
        r.pathPattern === "/workspace-invites/:token/accept" &&
        r.method === "POST"
    );
    expect(acceptInvite).toEqual(
      expect.objectContaining({
        serviceKey: "accounts-service",
        actionKey: "accounts.invites.accept",
        workspaceScoped: false,
        isPublic: false,
      })
    );
  });

  // TELE-VIEW-1: Telemetry Query Routes
  describe("Telemetry Routes (TELE-VIEW-1)", () => {
    it("should seed GET /workspaces/:workspaceId/telemetry/events as auth-required and workspace-scoped", () => {
      const eventsRoute = routeSeeds.find(
        (r) =>
          r.pathPattern === "/workspaces/:workspaceId/telemetry/events" &&
          r.method === "GET"
      );
      expect(eventsRoute).toBeDefined();
      expect(eventsRoute).toEqual(
        expect.objectContaining({
          method: "GET",
          pathPattern: "/workspaces/:workspaceId/telemetry/events",
          serviceKey: "telemetry-service",
          actionKey: "telemetry.events.listRecentForWorkspace",
          workspaceScoped: true,
          isPublic: false,
        })
      );
    });

    it("should seed GET /workspaces/:workspaceId/telemetry/stats/routes as auth-required and workspace-scoped", () => {
      const statsRoute = routeSeeds.find(
        (r) =>
          r.pathPattern === "/workspaces/:workspaceId/telemetry/stats/routes" &&
          r.method === "GET"
      );
      expect(statsRoute).toBeDefined();
      expect(statsRoute).toEqual(
        expect.objectContaining({
          method: "GET",
          pathPattern: "/workspaces/:workspaceId/telemetry/stats/routes",
          serviceKey: "telemetry-service",
          actionKey: "telemetry.stats.summaryByRoute",
          workspaceScoped: true,
          isPublic: false,
        })
      );
    });

    it("should route telemetry requests to telemetry-service", () => {
      const telemetryRoutes = routeSeeds.filter((r) =>
        r.pathPattern.includes("/telemetry/")
      );
      expect(telemetryRoutes.length).toBeGreaterThanOrEqual(2);
      telemetryRoutes.forEach((route) => {
        expect(route.serviceKey).toBe("telemetry-service");
        expect(route.workspaceScoped).toBe(true);
        expect(route.isPublic).toBe(false);
      });
    });
  });
});
