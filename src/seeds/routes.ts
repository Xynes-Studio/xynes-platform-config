export interface RouteSeed {
  method: string;
  pathPattern: string;
  targetPath?: string;
  serviceKey: string;
  actionKey: string;
  workspaceScoped: boolean;
  isPublic: boolean;
}

export const routeSeeds: RouteSeed[] = [
  // Accounts (ACCOUNTS-ME-1)
  {
    method: "GET",
    pathPattern: "/me",
    serviceKey: "accounts-service",
    actionKey: "accounts.me.getOrCreate",
    workspaceScoped: false,
    isPublic: false,
  },
  {
    method: "PATCH",
    pathPattern: "/me/profile",
    serviceKey: "accounts-service",
    actionKey: "accounts.user.updateSelf",
    workspaceScoped: false,
    isPublic: false,
  },
  // Workspaces (WORKSPACES-CORE-1)
  {
    method: "GET",
    pathPattern: "/workspaces",
    serviceKey: "accounts-service",
    actionKey: "accounts.workspaces.listForUser",
    workspaceScoped: false,
    isPublic: false,
  },
  {
    method: "POST",
    pathPattern: "/workspaces",
    serviceKey: "accounts-service",
    actionKey: "accounts.workspaces.create",
    workspaceScoped: false,
    isPublic: false,
  },
  {
    method: "GET",
    pathPattern: "/workspaces/:workspaceId/members",
    serviceKey: "accounts-service",
    actionKey: "accounts.workspace_members.listForWorkspace",
    workspaceScoped: true,
    isPublic: false,
  },
  // Workspace Invites (INVITES-CORE-1)
  {
    method: "POST",
    pathPattern: "/workspaces/:workspaceId/invites",
    serviceKey: "accounts-service",
    actionKey: "accounts.invites.create",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "GET",
    pathPattern: "/workspace-invites/:token",
    serviceKey: "accounts-service",
    actionKey: "accounts.invites.resolve",
    workspaceScoped: false,
    isPublic: true,
  },
  {
    method: "POST",
    pathPattern: "/workspace-invites/:token/accept",
    serviceKey: "accounts-service",
    actionKey: "accounts.invites.accept",
    workspaceScoped: false,
    isPublic: false,
  },
  {
    method: "POST",
    pathPattern: "/workspaces/:workspaceId/documents",
    serviceKey: "doc-service",
    actionKey: "docs.document.create",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "GET",
    pathPattern: "/workspaces/:workspaceId/documents/:id",
    serviceKey: "doc-service",
    actionKey: "docs.document.read",
    workspaceScoped: true,
    isPublic: false,
  },
  // Blog Routes
  {
    method: "GET",
    pathPattern: "/workspaces/:workspaceId/blog",
    serviceKey: "cms-core",
    actionKey: "cms.blog_entry.listPublished",
    workspaceScoped: true,
    isPublic: true,
  },
  {
    method: "GET",
    pathPattern: "/workspaces/:workspaceId/blog/:slug",
    serviceKey: "cms-core",
    actionKey: "cms.blog_entry.getPublishedBySlug",
    workspaceScoped: true,
    isPublic: true,
  },
  // CMS Content Types (admin metadata)
  {
    method: "GET",
    pathPattern: "/workspaces/:workspaceId/content-types",
    targetPath: "/content-types",
    serviceKey: "cms-core",
    actionKey: "cms.content_types.listForWorkspace",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "GET",
    pathPattern: "/workspaces/:workspaceId/content-directories",
    targetPath: "/content-directories",
    serviceKey: "cms-core",
    actionKey: "cms.content_directories.listForWorkspace",
    workspaceScoped: true,
    isPublic: false,
  },
  // CMS Entry Authoring Routes (CMS-DF-005)
  {
    method: "POST",
    pathPattern: "/workspaces/:workspaceId/content/entries",
    targetPath: "/content/entries",
    serviceKey: "cms-core",
    actionKey: "cms.entry.create",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "PATCH",
    pathPattern: "/workspaces/:workspaceId/content/entries/:entryId",
    targetPath: "/content/entries/:entryId",
    serviceKey: "cms-core",
    actionKey: "cms.entry.update",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "DELETE",
    pathPattern: "/workspaces/:workspaceId/content/entries/:entryId",
    targetPath: "/content/entries/:entryId",
    serviceKey: "cms-core",
    actionKey: "cms.entry.delete",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "POST",
    pathPattern: "/workspaces/:workspaceId/content/entries/:entryId/publish",
    targetPath: "/content/entries/:entryId/publish",
    serviceKey: "cms-core",
    actionKey: "cms.entry.publish",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "GET",
    pathPattern: "/workspaces/:workspaceId/content/entries",
    targetPath: "/content/entries",
    serviceKey: "cms-core",
    actionKey: "cms.entry.listByDirectory",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "GET",
    pathPattern: "/workspaces/:workspaceId/content/entries/:entryId",
    targetPath: "/content/entries/:entryId",
    serviceKey: "cms-core",
    actionKey: "cms.entry.getById",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "PUT",
    pathPattern: "/workspaces/:workspaceId/content/entries/:entryId/collaborators",
    targetPath: "/content/entries/:entryId/collaborators",
    serviceKey: "cms-core",
    actionKey: "cms.entry.collaborators.set",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "POST",
    pathPattern: "/workspaces/:workspaceId/content/entries/:entryId/favorite",
    targetPath: "/content/entries/:entryId/favorite",
    serviceKey: "cms-core",
    actionKey: "cms.entry.favorite.toggle",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "GET",
    pathPattern: "/workspaces/:workspaceId/content/entries/favorites",
    targetPath: "/content/entries/favorites",
    serviceKey: "cms-core",
    actionKey: "cms.entry.favorite.list",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "POST",
    pathPattern: "/workspaces/:workspaceId/content/entries/:entryId/share-link",
    targetPath: "/content/entries/:entryId/share-link",
    serviceKey: "cms-core",
    actionKey: "cms.entry.share.generateInternalLink",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "POST",
    pathPattern: "/workspaces/:workspaceId/content-directories",
    targetPath: "/content-directories",
    serviceKey: "cms-core",
    actionKey: "cms.content_directories.create",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "PATCH",
    pathPattern: "/workspaces/:workspaceId/content-directories/:directoryId",
    targetPath: "/content-directories/:directoryId",
    serviceKey: "cms-core",
    actionKey: "cms.content_directories.update",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "DELETE",
    pathPattern: "/workspaces/:workspaceId/content-directories/:directoryId",
    targetPath: "/content-directories/:directoryId",
    serviceKey: "cms-core",
    actionKey: "cms.content_directories.delete",
    workspaceScoped: true,
    isPublic: false,
  },
  // Generic Content Routes (ROUTES-CONTENT-1)
  // Template-driven routes: avoid per-template paths like /programs or /events
  {
    method: "GET",
    pathPattern: "/workspaces/:workspaceId/content/:routeSegment",
    serviceKey: "cms-core",
    actionKey: "cms.content.listPublished",
    workspaceScoped: true,
    isPublic: true,
  },
  {
    method: "GET",
    pathPattern: "/workspaces/:workspaceId/content/:routeSegment/:slug",
    serviceKey: "cms-core",
    actionKey: "cms.content.getPublishedBySlug",
    workspaceScoped: true,
    isPublic: true,
  },
  // Comment Routes (CMS-COMMENTS-PUBLIC-1)
  // Public comment creation - handler enforces content length limits for anonymous users
  // and sets default status to "pending" for moderation
  {
    method: "POST",
    pathPattern: "/workspaces/:workspaceId/content-entries/:entryId/comments",
    serviceKey: "cms-core",
    actionKey: "cms.comments.create",
    workspaceScoped: true,
    isPublic: true,
  },
  // Public comment listing - unauthenticated users only see approved comments
  {
    method: "GET",
    pathPattern: "/workspaces/:workspaceId/content-entries/:entryId/comments",
    serviceKey: "cms-core",
    actionKey: "cms.comments.listForEntry",
    workspaceScoped: true,
    isPublic: true,
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // Telemetry Routes (TELE-VIEW-1)
  // Admin/Owner only - requires telemetry.events.view permission
  // ─────────────────────────────────────────────────────────────────────────────
  {
    method: "GET",
    pathPattern: "/workspaces/:workspaceId/telemetry/events",
    serviceKey: "telemetry-service",
    actionKey: "telemetry.events.listRecentForWorkspace",
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: "GET",
    pathPattern: "/workspaces/:workspaceId/telemetry/stats/routes",
    serviceKey: "telemetry-service",
    actionKey: "telemetry.stats.summaryByRoute",
    workspaceScoped: true,
    isPublic: false,
  },
];
