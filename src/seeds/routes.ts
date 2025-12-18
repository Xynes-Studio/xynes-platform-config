export interface RouteSeed {
  method: string;
  pathPattern: string;
  serviceKey: string;
  actionKey: string;
  workspaceScoped: boolean;
  isPublic: boolean;
}

export const routeSeeds: RouteSeed[] = [
  {
    method: 'POST',
    pathPattern: '/workspaces/:workspaceId/documents',
    serviceKey: 'doc-service',
    actionKey: 'docs.document.create',
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: 'GET',
    pathPattern: '/workspaces/:workspaceId/documents/:id',
    serviceKey: 'doc-service',
    actionKey: 'docs.document.read',
    workspaceScoped: true,
    isPublic: false,
  },
  // Blog Routes
  {
    method: 'GET',
    pathPattern: '/workspaces/:workspaceId/blog',
    serviceKey: 'cms-core',
    actionKey: 'cms.blog_entry.listPublished',
    workspaceScoped: true,
    isPublic: true,
  },
  {
    method: 'GET',
    pathPattern: '/workspaces/:workspaceId/blog/:slug',
    serviceKey: 'cms-core',
    actionKey: 'cms.blog_entry.getPublishedBySlug',
    workspaceScoped: true,
    isPublic: true,
  },
  // Generic Content Routes (ROUTES-CONTENT-1)
  // Template-driven routes: avoid per-template paths like /programs or /events
  {
    method: 'GET',
    pathPattern: '/workspaces/:workspaceId/content/:routeSegment',
    serviceKey: 'cms-core',
    actionKey: 'cms.content.listPublished',
    workspaceScoped: true,
    isPublic: true,
  },
  {
    method: 'GET',
    pathPattern: '/workspaces/:workspaceId/content/:routeSegment/:slug',
    serviceKey: 'cms-core',
    actionKey: 'cms.content.getPublishedBySlug',
    workspaceScoped: true,
    isPublic: true,
  },
  // Comment Routes
  {
    method: 'POST',
    pathPattern: '/workspaces/:workspaceId/content-entries/:entryId/comments',
    serviceKey: 'cms-core',
    actionKey: 'cms.comments.create',
    workspaceScoped: true,
    isPublic: false,
  },
  {
    method: 'GET',
    pathPattern: '/workspaces/:workspaceId/content-entries/:entryId/comments',
    serviceKey: 'cms-core',
    actionKey: 'cms.comments.listForEntry',
    workspaceScoped: true,
    isPublic: false,
  },
];
