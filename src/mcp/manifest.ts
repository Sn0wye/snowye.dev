import { tools } from './tools';

export const MCP_PROTOCOL_VERSION = '2025-06-18';
export const MCP_ENDPOINT = 'https://snowye.dev/api/mcp';

/**
 * One description of the server, shared by the well-known discovery document,
 * the endpoint's own GET, and the docs page — so they cannot disagree.
 */
export const mcpManifest = () => ({
  $schema:
    'https://modelcontextprotocol.io/schemas/draft/2025-06-18/server.json',
  name: 'snowye.dev',
  title: 'Gabriel Trzimajewski — snowye.dev',
  description:
    'Facts about Gabriel Trzimajewski: CV, work history, skills, projects and contact details, served from the canonical résumé source.',
  version: '1.0.0',
  websiteUrl: 'https://snowye.dev',
  protocolVersion: MCP_PROTOCOL_VERSION,
  remotes: [{ type: 'streamable-http', url: MCP_ENDPOINT }],
  authentication: { type: 'none' },
  capabilities: { tools: { listChanged: false } },
  tools: tools.map(({ name, description, inputSchema }) => ({
    name,
    description,
    inputSchema
  }))
});
