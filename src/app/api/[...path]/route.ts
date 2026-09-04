import { type NextRequest, NextResponse } from 'next/server';

const notFound = (request: NextRequest) =>
  NextResponse.json(
    {
      type: 'https://snowye.dev/problems/api-route-not-found',
      title: 'API route not found',
      status: 404,
      detail: `No machine endpoint exists at ${request.nextUrl.pathname}.`,
      instance: request.nextUrl.pathname,
      code: 'API_ROUTE_NOT_FOUND',
      message: 'The requested API endpoint does not exist.',
      resolution:
        'Inspect /openapi.json for supported endpoints or /.well-known/mcp.json for MCP discovery.'
    },
    {
      status: 404,
      headers: {
        'content-type': 'application/problem+json',
        'access-control-allow-origin': '*',
        'access-control-allow-methods':
          'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS',
        'access-control-allow-headers':
          'accept, content-type, mcp-protocol-version'
      }
    }
  );

export const GET = notFound;
export const HEAD = notFound;
export const POST = notFound;
export const PUT = notFound;
export const PATCH = notFound;
export const DELETE = notFound;
export const OPTIONS = notFound;
