import { mcpManifest } from '@/mcp/manifest';

export const dynamic = 'force-static';

/**
 * Well-known autodiscovery: a client given only `https://snowye.dev` can find
 * the MCP endpoint and its tools here without a round trip to the server.
 */
export function GET() {
  return new Response(JSON.stringify(mcpManifest(), null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=3600'
    }
  });
}
