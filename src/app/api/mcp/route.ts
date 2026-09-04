import { type NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/ratelimit';
import { MCP_PROTOCOL_VERSION } from '@/mcp/manifest';
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

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const corsHeaders = (request: NextRequest) => {
  const origin = request.headers.get('origin');
  return {
    'access-control-allow-origin': origin ?? '*',
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers':
      'accept, content-type, mcp-protocol-version',
    'access-control-expose-headers': 'mcp-protocol-version',
    'mcp-protocol-version': PROTOCOL_VERSION,
    vary: 'Origin'
  };
};

const allowedOrigins = (request: NextRequest) => {
  const origins = new Set(['https://snowye.dev']);
  if (
    process.env.NODE_ENV !== 'production' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(request.nextUrl.hostname)
  )
    origins.add(request.nextUrl.origin);
  return origins;
};

const hasSafeOrigin = (request: NextRequest) => {
  const origin = request.headers.get('origin');
  return origin === null || allowedOrigins(request).has(origin);
};

const result = (id: string | number, value: unknown) => ({
  jsonrpc: '2.0' as const,
  id,
  result: value
});

const error = (
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown
) => ({
  jsonrpc: '2.0' as const,
  id,
  error: { code, message, ...(data === undefined ? {} : { data }) }
});

const rpcResponse = (request: NextRequest, value: unknown, status = 200) =>
  NextResponse.json(value, {
    status,
    headers: corsHeaders(request)
  });

const transportError = (
  request: NextRequest,
  status: number,
  code: string,
  message: string,
  resolution: string
) =>
  NextResponse.json(
    {
      type: `https://snowye.dev/problems/${code.toLowerCase()}`,
      title: message,
      status,
      detail: message,
      instance: request.nextUrl.pathname,
      code,
      message,
      resolution
    },
    {
      status,
      headers: {
        ...corsHeaders(request),
        'content-type': 'application/problem+json'
      }
    }
  );

const invalidMessage = (body: unknown): string | null => {
  if (!isObject(body)) return 'Request must be one JSON object.';
  if (body.jsonrpc !== '2.0') return 'jsonrpc must equal "2.0".';
  if (
    'id' in body &&
    !(
      typeof body.id === 'string' ||
      (typeof body.id === 'number' && Number.isFinite(body.id))
    )
  )
    return 'id must be a string or finite number.';

  if (!('method' in body)) {
    if (!('id' in body)) return 'A JSON-RPC response must include an id.';
    const hasResult = 'result' in body;
    const hasError = 'error' in body;
    if (hasResult === hasError)
      return 'A JSON-RPC response must include exactly one of result or error.';
    if (
      hasError &&
      (!isObject(body.error) ||
        typeof body.error.code !== 'number' ||
        !Number.isInteger(body.error.code) ||
        typeof body.error.message !== 'string')
    )
      return 'A JSON-RPC error must contain a finite numeric code and string message.';
    return null;
  }

  if (typeof body.method !== 'string' || body.method.length === 0)
    return 'method must be a non-empty string.';
  if ('params' in body && !isObject(body.params))
    return 'params must be an object when provided.';
  return null;
};

const accepts = (header: string | null, mediaType: string) => {
  const [expectedType, expectedSubtype] = mediaType.split('/');
  const matches = (header ?? '')
    .toLowerCase()
    .split(',')
    .map((part, index) => {
      const [range = '', ...parameters] = part.trim().split(';');
      const [type, subtype] = range.split('/');
      const qualityParameter = parameters
        .map(parameter => /^q\s*=\s*(.*)$/.exec(parameter.trim())?.[1])
        .find(value => value !== undefined);
      const validQuality =
        qualityParameter === undefined ||
        /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(qualityParameter);
      const quality = validQuality ? Number(qualityParameter ?? 1) : 0;
      const specificity = type === '*' ? 0 : subtype === '*' ? 1 : 2;
      return { type, subtype, quality, specificity, index };
    })
    .filter(
      range => range.type === expectedType && range.subtype === expectedSubtype
    )
    .sort(
      (left, right) =>
        right.specificity - left.specificity ||
        right.quality - left.quality ||
        left.index - right.index
    );

  return (matches[0]?.quality ?? 0) > 0;
};

const validateToolArguments = (
  schema: Record<string, unknown>,
  args: Record<string, unknown>
) => {
  const properties = isObject(schema.properties) ? schema.properties : {};
  const required = Array.isArray(schema.required)
    ? schema.required.filter((key): key is string => typeof key === 'string')
    : [];

  for (const key of required) {
    if (!(key in args)) return `Missing required argument: ${key}`;
  }
  if (schema.additionalProperties === false) {
    const extra = Object.keys(args).find(key => !(key in properties));
    if (extra) return `Unknown argument: ${extra}`;
  }
  for (const [key, value] of Object.entries(args)) {
    const property = properties[key];
    if (!isObject(property)) continue;
    if (property.type === 'string' && typeof value !== 'string')
      return `${key} must be a string.`;
    if (property.type === 'boolean' && typeof value !== 'boolean')
      return `${key} must be a boolean.`;
    if (Array.isArray(property.enum) && !property.enum.includes(value))
      return `${key} must be one of: ${property.enum.join(', ')}.`;
  }
  return null;
};

const validateParams = (message: JsonRpcRequest): string | null => {
  const params = message.params ?? {};
  switch (message.method) {
    case 'initialize':
      if (typeof params.protocolVersion !== 'string')
        return 'initialize.params.protocolVersion must be a string.';
      if (!isObject(params.capabilities))
        return 'initialize.params.capabilities must be an object.';
      if (
        !isObject(params.clientInfo) ||
        typeof params.clientInfo.name !== 'string' ||
        typeof params.clientInfo.version !== 'string'
      )
        return 'initialize.params.clientInfo must contain string name and version.';
      return null;
    case 'ping':
    case 'notifications/initialized':
      return Object.keys(params).length === 0
        ? null
        : `${message.method} does not accept parameters.`;
    case 'tools/list':
      return params.cursor === undefined || typeof params.cursor === 'string'
        ? null
        : 'tools/list cursor must be a string.';
    case 'tools/call': {
      if (typeof params.name !== 'string')
        return 'tools/call name must be a string.';
      if (params.arguments !== undefined && !isObject(params.arguments))
        return 'tools/call arguments must be an object.';
      const tool = toolByName.get(params.name);
      if (!tool) return `Unknown tool: ${params.name}`;
      return validateToolArguments(
        tool.inputSchema,
        (params.arguments as Record<string, unknown> | undefined) ?? {}
      );
    }
    default:
      return null;
  }
};

const handleMessage = (message: JsonRpcRequest) => {
  const { id, method, params = {} } = message;
  const isNotification = id === undefined;

  if (method === 'notifications/initialized')
    return isNotification ? null : error(id, -32600, 'Invalid Request');

  if (isNotification) return null;

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
      const name = params.name as string;
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
  if (!hasSafeOrigin(request))
    return transportError(
      request,
      403,
      'MCP_ORIGIN_FORBIDDEN',
      'The request Origin is not allowed.',
      'Send the request from snowye.dev or use a non-browser MCP client without an Origin header.'
    );

  const contentType = request.headers
    .get('content-type')
    ?.split(';', 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== 'application/json')
    return transportError(
      request,
      415,
      'MCP_CONTENT_TYPE_REQUIRED',
      'MCP POST requests require Content-Type: application/json.',
      'Set Content-Type to application/json and retry.'
    );

  if (
    !accepts(request.headers.get('accept'), 'application/json') ||
    !accepts(request.headers.get('accept'), 'text/event-stream')
  )
    return transportError(
      request,
      406,
      'MCP_ACCEPT_REQUIRED',
      'MCP POST requests must accept application/json and text/event-stream.',
      'Set Accept to "application/json, text/event-stream" and retry.'
    );

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return rpcResponse(request, error(null, -32700, 'Parse error'), 400);
  }

  if (Array.isArray(body))
    return rpcResponse(
      request,
      error(null, -32600, 'Invalid Request', {
        reason: 'MCP Streamable HTTP accepts one JSON-RPC message per POST.'
      }),
      400
    );

  const shapeError = invalidMessage(body);
  if (shapeError)
    return rpcResponse(
      request,
      error(null, -32600, 'Invalid Request', { reason: shapeError }),
      400
    );

  const message = body as unknown as JsonRpcRequest | JsonRpcResponse;
  if (
    (!('method' in message) || message.method !== 'initialize') &&
    request.headers.get('mcp-protocol-version') !== PROTOCOL_VERSION
  )
    return transportError(
      request,
      400,
      'MCP_PROTOCOL_VERSION_REQUIRED',
      `MCP-Protocol-Version must be ${PROTOCOL_VERSION} after initialization.`,
      `Set MCP-Protocol-Version: ${PROTOCOL_VERSION} and retry.`
    );

  if (!('method' in message))
    return new NextResponse(null, {
      status: 202,
      headers: corsHeaders(request)
    });

  const paramsError = validateParams(message);
  if (paramsError) {
    if (message.id === undefined)
      return new NextResponse(null, {
        status: 202,
        headers: corsHeaders(request)
      });
    return rpcResponse(
      request,
      error(message.id, -32602, 'Invalid params', { reason: paramsError })
    );
  }

  const response = handleMessage(message);
  if (response === null)
    return new NextResponse(null, {
      status: 202,
      headers: corsHeaders(request)
    });
  return rpcResponse(request, response);
};

export const POST = withRateLimit({
  identifier: 'mcp',
  limit: 60,
  onLimit: (request, retryAfter) =>
    rpcResponse(
      request,
      error(null, -32000, 'Rate limit exceeded', {
        retryAfter,
        resolution: `Retry after ${retryAfter} seconds.`
      }),
      429
    )
})(post);

/** This stateless deployment does not provide a server-initiated SSE stream. */
export function GET(request: NextRequest) {
  if (!hasSafeOrigin(request))
    return transportError(
      request,
      403,
      'MCP_ORIGIN_FORBIDDEN',
      'The request Origin is not allowed.',
      'Use an allowed snowye.dev origin.'
    );

  const response = transportError(
    request,
    405,
    'MCP_SSE_NOT_SUPPORTED',
    'Server-initiated SSE streams are not supported.',
    'Send one JSON-RPC message with POST, or use /.well-known/mcp.json for discovery.'
  );
  response.headers.set('allow', 'POST, OPTIONS');
  return response;
}

export function OPTIONS(request: NextRequest) {
  if (!hasSafeOrigin(request))
    return transportError(
      request,
      403,
      'MCP_ORIGIN_FORBIDDEN',
      'The request Origin is not allowed.',
      'Use an allowed snowye.dev origin.'
    );
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request)
  });
}
