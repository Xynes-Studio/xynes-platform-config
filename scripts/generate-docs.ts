import { db } from '../src/db/index';
import { platformRoutes } from '../src/db/platformRoutes';
import { desc } from 'drizzle-orm';
import * as fs from 'fs/promises';
import * as path from 'path';

// Define types for Drizzle results
type Route = typeof platformRoutes.$inferSelect;

async function generateDocs() {
  console.log('Fetching routes from database...');
  const routes = await db.select().from(platformRoutes).orderBy(desc(platformRoutes.serviceKey), desc(platformRoutes.pathPattern));

  if (routes.length === 0) {
    console.log('No routes found.');
    return;
  }

  const docsDir = path.resolve(__dirname, '../../api-docs');
  console.log(`Generating docs in ${docsDir}...`);

  // Ensure docs directory exists
  try {
    await fs.mkdir(docsDir, { recursive: true });
  } catch {
    // ignore if exists
  }

  // Group by service key
  const routesByService: Record<string, Route[]> = {};
  for (const route of routes) {
    if (!routesByService[route.serviceKey]) {
      routesByService[route.serviceKey] = [];
    }
    routesByService[route.serviceKey].push(route);
  }

  // Generate MDX files
  for (const [serviceKey, serviceRoutes] of Object.entries(routesByService)) {
    const serviceDir = path.join(docsDir, serviceKey);
    await fs.mkdir(serviceDir, { recursive: true });

    for (const route of serviceRoutes) {
      const fileName = `${route.method.toLowerCase()}_${route.actionKey.replace(/\./g, '_')}.mdx`;
      const filePath = path.join(serviceDir, fileName);
      
      const content = generateMdxContent(route);
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`Generated ${fileName}`);
    }
  }

  console.log('Documentation generation complete!');
  process.exit(0);
}

function generateMdxContent(route: Route): string {
    const permissions = route.isPublic 
        ? 'Public' 
        : `**Required Capability:** \`${route.actionKey}\``;

    // Construct curl example
    // Replace :param with placeholder
    const url = `https://api.xynes.com${route.pathPattern.replace(/:([a-zA-Z0-9_]+)/g, '{$1}')}`;
    
    // Add query params if generally expected? For now just simple.
    
    let curlCommand = `curl -X ${route.method} "${url}" \\
  -H "Content-Type: application/json"`;

    if (!route.isPublic) {
        curlCommand += ` \\
  -H "Authorization: Bearer <YOUR_TOKEN>"`;
    }

    if (route.method === 'POST' || route.method === 'PUT') {
        curlCommand += ` \\
  -d '{
    "foo": "bar"
  }'`;
    }

    return `---
title: ${route.method} ${route.pathPattern}
description: API documentation for ${route.actionKey}
---

# ${route.method} ${route.pathPattern}

**Action Key:** \`${route.actionKey}\`

**Service:** \`${route.serviceKey}\`

## Permissions

${permissions}

## Example Request

\`\`\`bash
${curlCommand}
\`\`\`
`;
}

generateDocs().catch(err => {
  console.error('Error generating docs:', err);
  process.exit(1);
});
