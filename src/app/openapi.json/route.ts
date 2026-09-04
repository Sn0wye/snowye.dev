import { MCP_ENDPOINT, MCP_PROTOCOL_VERSION } from '@/mcp/manifest';
import { tools } from '@/mcp/tools';

export const dynamic = 'force-static';

const problemSchema = {
  type: 'object',
  required: [
    'type',
    'title',
    'status',
    'detail',
    'code',
    'message',
    'resolution'
  ],
  properties: {
    type: { type: 'string', format: 'uri' },
    title: { type: 'string' },
    status: { type: 'integer', minimum: 400, maximum: 599 },
    detail: { type: 'string' },
    instance: { type: 'string' },
    code: { type: 'string' },
    message: { type: 'string' },
    resolution: { type: 'string' }
  },
  additionalProperties: false
};

const rpcErrorSchema = {
  type: 'object',
  required: ['jsonrpc', 'id', 'error'],
  properties: {
    jsonrpc: { const: '2.0' },
    id: { type: ['string', 'number', 'null'] },
    error: {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: { type: 'integer' },
        message: { type: 'string' },
        data: true
      }
    }
  }
};

const document = {
  openapi: '3.1.0',
  info: {
    title: 'snowye.dev Machine API',
    version: '1.0.0',
    description:
      'Machine-readable discovery and stateless MCP Streamable HTTP endpoints.'
  },
  servers: [{ url: 'https://snowye.dev' }],
  paths: {
    '/.well-known/mcp.json': {
      get: {
        operationId: 'discoverMcpServer',
        summary: 'Discover the MCP server',
        responses: {
          '200': {
            description: 'MCP server metadata',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: [
                    'name',
                    'version',
                    'protocolVersion',
                    'remotes',
                    'tools'
                  ],
                  properties: {
                    name: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    version: { type: 'string' },
                    websiteUrl: { type: 'string', format: 'uri' },
                    protocolVersion: { const: MCP_PROTOCOL_VERSION },
                    remotes: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['type', 'url'],
                        properties: {
                          type: { const: 'streamable-http' },
                          url: { const: MCP_ENDPOINT }
                        }
                      }
                    },
                    authentication: { type: 'object' },
                    capabilities: { type: 'object' },
                    tools: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: ['name', 'description', 'inputSchema'],
                        properties: {
                          name: { type: 'string' },
                          description: { type: 'string' },
                          inputSchema: { type: 'object' }
                        }
                      }
                    }
                  }
                },
                example: {
                  name: 'snowye.dev',
                  protocolVersion: MCP_PROTOCOL_VERSION,
                  remotes: [{ type: 'streamable-http', url: MCP_ENDPOINT }],
                  tools: tools.map(({ name, description, inputSchema }) => ({
                    name,
                    description,
                    inputSchema
                  }))
                }
              }
            }
          }
        }
      }
    },
    '/api/mcp': {
      post: {
        operationId: 'sendMcpMessage',
        summary: 'Send one MCP JSON-RPC message',
        description:
          'Requires Content-Type application/json and an Accept header listing application/json and text/event-stream. Requests after initialize require MCP-Protocol-Version.',
        parameters: [
          {
            name: 'MCP-Protocol-Version',
            in: 'header',
            required: false,
            schema: { const: MCP_PROTOCOL_VERSION }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  {
                    type: 'object',
                    required: ['jsonrpc', 'method'],
                    properties: {
                      jsonrpc: { const: '2.0' },
                      id: { type: ['string', 'number'] },
                      method: {
                        type: 'string',
                        enum: [
                          'initialize',
                          'notifications/initialized',
                          'ping',
                          'tools/list',
                          'tools/call'
                        ]
                      },
                      params: { type: 'object' }
                    }
                  },
                  {
                    type: 'object',
                    required: ['jsonrpc', 'id', 'result'],
                    properties: {
                      jsonrpc: { const: '2.0' },
                      id: { type: ['string', 'number'] },
                      result: true
                    }
                  },
                  {
                    type: 'object',
                    required: ['jsonrpc', 'id', 'error'],
                    properties: {
                      jsonrpc: { const: '2.0' },
                      id: { type: ['string', 'number'] },
                      error: {
                        type: 'object',
                        required: ['code', 'message'],
                        properties: {
                          code: { type: 'integer' },
                          message: { type: 'string' },
                          data: true
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'JSON-RPC result or error',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    {
                      type: 'object',
                      required: ['jsonrpc', 'id', 'result'],
                      properties: {
                        jsonrpc: { const: '2.0' },
                        id: { type: ['string', 'number'] },
                        result: true
                      }
                    },
                    rpcErrorSchema
                  ]
                }
              }
            }
          },
          '202': {
            description:
              'A notification or client JSON-RPC response was accepted'
          },
          '400': {
            description: 'Invalid JSON-RPC message or protocol version',
            content: {
              'application/json': { schema: rpcErrorSchema },
              'application/problem+json': { schema: problemSchema }
            }
          },
          '403': {
            description: 'Forbidden Origin',
            content: {
              'application/problem+json': { schema: problemSchema }
            }
          },
          '406': {
            description: 'Required response media types were not accepted',
            content: {
              'application/problem+json': { schema: problemSchema }
            }
          },
          '415': {
            description: 'JSON Content-Type required',
            content: {
              'application/problem+json': { schema: problemSchema }
            }
          },
          '429': {
            description: 'Rate limit exceeded',
            headers: {
              'Retry-After': { schema: { type: 'integer' } }
            },
            content: { 'application/json': { schema: rpcErrorSchema } }
          }
        }
      },
      get: {
        operationId: 'openMcpSseStream',
        summary: 'Probe for server-initiated SSE',
        responses: {
          '405': {
            description: 'SSE is unsupported by this stateless server',
            content: {
              'application/problem+json': { schema: problemSchema }
            }
          },
          '403': {
            description: 'Forbidden Origin',
            content: {
              'application/problem+json': { schema: problemSchema }
            }
          }
        }
      },
      options: {
        operationId: 'preflightMcp',
        summary: 'MCP CORS preflight',
        responses: {
          '204': { description: 'Preflight accepted' },
          '403': {
            description: 'Forbidden Origin',
            content: {
              'application/problem+json': { schema: problemSchema }
            }
          }
        }
      }
    },
    '/api': {
      get: {
        operationId: 'apiIndexNotFound',
        responses: {
          '404': {
            description: 'There is no API index endpoint',
            content: {
              'application/problem+json': { schema: problemSchema }
            }
          }
        }
      }
    },
    '/api/{path}': {
      parameters: [
        {
          name: 'path',
          in: 'path',
          required: true,
          description: 'An unrecognized API path.',
          schema: { type: 'string' }
        }
      ],
      get: {
        operationId: 'unknownApiPath',
        responses: {
          '404': {
            description: 'Unknown API endpoint',
            content: {
              'application/problem+json': { schema: problemSchema }
            }
          }
        }
      }
    }
  }
};

export function GET() {
  return Response.json(document, {
    headers: {
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=3600'
    }
  });
}
