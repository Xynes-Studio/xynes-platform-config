import { describe, it, expect } from "bun:test";
import { routeSeeds } from "../src/seeds/routes";

describe("Route Seeds", () => {
  it("should include exactly the two generic content routes", () => {
    const genericContentRoutes = routeSeeds.filter((r) =>
      /\/content(\/|$)/.test(r.pathPattern),
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
      ]),
    );
  });
});

