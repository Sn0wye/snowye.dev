import { type NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/ratelimit';
import { MCP_PROTOCOL_VERSION, mcpManifest } from '@/mcp/manifest';
import { toolByName, tools } from '@/mcp/tools';

/**
 * Model Context Protocol endpoint, stateless Streamable HTTP.
 *
 * Every request is a self-contained JSON-RPC 2.0 message; there is no session
 * to keep, so no SSE stream and no server state — which is what lets this run
 * on serverless. Written against the raw protocol rather than an SDK to keep
 * the dependency surface at zero.
 */

const PROTOCOL_VERSION = MCP_PROTOCOL_VERSION;

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type, mcp-protocol-version',
  'access-control-expose-headers': 'mcp-protocol-version'
};

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

const result = (id: JsonRpcRequest['id'], value: unknown) => ({
  jsonrpc: '2.0' as const,
  id,
  result: value
});

const error = (id: JsonRpcRequest['id'], code: number, message: string) => ({
  jsonrpc: '2.0' as const,
  id,
  error: { code, message }
});

const handleMessage = (message: JsonRpcRequest) => {
  const { id, method, params = {} } = message;

  switch (method) {
    case 'initialize':
      return result(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'snowye.dev', version: '1.0.0' },
        instructions:
          'Facts about Gabriel Trzimajewski (snowye.dev) — CV, work history, skills, projects and contact details, served from the canonical résumé source.'
      });

    case 'ping':
      return result(id, {});

    case 'tools/list':
      return result(id, {
        tools: tools.map(({ name, description, inputSchema }) => ({
          name,
          description,
          inputSchema
        }))
      });

    case 'tools/call': {
      const name = String(params.name ?? '');
      const tool = toolByName.get(name);
      if (!tool) return error(id, -32602, `Unknown tool: ${name}`);

      try {
        const output = tool.run(
          (params.arguments as Record<string, unknown>) ?? {}
        );
        const text =
          typeof output === 'string' ? output : JSON.stringify(output, null, 2);

        return result(id, {
          content: [{ type: 'text', text }],
          isError: false
        });
      } catch (cause) {
        return result(id, {
          content: [
            {
              type: 'text',
              text: cause instanceof Error ? cause.message : 'Tool failed.'
            }
          ],
          isError: true
        });
      }
    }

    default:
      return error(id, -32601, `Method not found: ${method}`);
  }
};

const post = async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(error(null, -32700, 'Parse error'), {
      status: 400
    });
  }

  const messages = (Array.isArray(body) ? body : [body]) as JsonRpcRequest[];
  // Notifications carry no id and, per JSON-RPC, get no response body.
  const responses = messages
    .filter(message => message.id !== undefined && message.id !== null)
    .map(handleMessage);

  if (responses.length === 0)
    return new NextResponse(null, { status: 202, headers: CORS });

  return NextResponse.json(Array.isArray(body) ? responses : responses[0], {
    headers: CORS
  });
};

export const POST = withRateLimit({ identifier: 'mcp', limit: 60 })(post);

/** Discovery for humans and clients that probe with GET before connecting. */
export function GET() {
  return NextResponse.json(mcpManifest(), { headers: CORS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
