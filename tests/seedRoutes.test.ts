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

  it("should not seed comment routes as public by default", () => {
    const commentCreate = routeSeeds.find(
      (r) => r.actionKey === "cms.comments.create",
    );
    expect(commentCreate).toEqual(
      expect.objectContaining({
        method: "POST",
        isPublic: false,
      }),
    );

    const commentList = routeSeeds.find(
      (r) => r.actionKey === "cms.comments.listForEntry",
    );
    expect(commentList).toEqual(
      expect.objectContaining({
        method: "GET",
        isPublic: false,
      }),
    );
  });
});
