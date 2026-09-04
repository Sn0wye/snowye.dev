import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process';

const port = 3199;
const baseUrl = `http://127.0.0.1:${port}`;
let server: ChildProcessWithoutNullStreams;

const visibleText = (html: string) =>
  html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const waitForServer = async () => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/openapi.json`);
      if (response.ok) return;
    } catch {
      // The production server has not opened its socket yet.
    }
    await Bun.sleep(50);
  }
  throw new Error('Timed out waiting for the production server.');
};

beforeAll(async () => {
  server = spawn('bun', ['run', 'start', '--port', String(port)], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'production' }
  });
  await waitForServer();
});

afterAll(() => {
  server.kill('SIGTERM');
});

describe('human and agent representations', () => {
  test('serves substantial semantic homepage HTML in both languages', async () => {
    for (const [path, language] of [
      ['/', 'en'],
      ['/pt', 'pt']
    ] as const) {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: { accept: 'text/html' }
      });
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
      expect(html).toContain(`<html lang="${language}">`);
      expect(html).toContain('<h1');
      expect(html).toContain('<h2');
      expect(visibleText(html).length).toBeGreaterThan(500);
      expect(html).toContain('property="og:type"');
      expect(html).toContain('property="og:image"');
    }
  });

  test('negotiates Markdown and varies caches by Accept', async () => {
    const response = await fetch(`${baseUrl}/`, {
      headers: { accept: 'text/markdown, text/html;q=0.5' }
    });
    const markdown = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/markdown');
    expect(response.headers.get('vary')?.toLowerCase()).toContain('accept');
    expect(markdown).toStartWith('# Gabriel Trzimajewski');
    expect(markdown.length).toBeGreaterThan(500);
  });

  test('respects q=0 and rejects unsupported representations', async () => {
    const html = await fetch(`${baseUrl}/`, {
      headers: { accept: 'text/markdown;q=0, text/html' }
    });
    expect(html.headers.get('content-type')).toContain('text/html');

    const unsupported = await fetch(`${baseUrl}/`, {
      headers: { accept: 'image/avif' }
    });
    expect(unsupported.status).toBe(406);
    expect(unsupported.headers.get('vary')?.toLowerCase()).toContain('accept');
  });

  test('returns recoverable HTML and Markdown 404 responses', async () => {
    const htmlResponse = await fetch(`${baseUrl}/missing-page`, {
      headers: { accept: 'text/html' }
    });
    const html = await htmlResponse.text();
    expect(htmlResponse.status).toBe(404);
    expect(html).toContain('/sitemap.xml');
    expect(html).toContain('/llms.txt');

    const markdownResponse = await fetch(`${baseUrl}/missing-page`, {
      headers: { accept: 'text/markdown' }
    });
    const markdown = await markdownResponse.text();
    expect(markdownResponse.status).toBe(404);
    expect(markdownResponse.headers.get('content-type')).toContain(
      'text/markdown'
    );
    expect(markdownResponse.headers.get('vary')?.toLowerCase()).toContain(
      'accept'
    );
    expect(markdown).toContain('[Sitemap](https://snowye.dev/sitemap.xml)');

    const unknownPrefix = await fetch(`${baseUrl}/ptfoo`, {
      headers: { accept: 'text/markdown' }
    });
    expect(unknownPrefix.headers.get('content-language')).toBe('en-US');
  });

  test('publishes substantial trust pages and privacy discovery', async () => {
    for (const path of ['/about', '/contact', '/privacy']) {
      const response = await fetch(`${baseUrl}${path}`);
      expect(response.status).toBe(200);
      expect(visibleText(await response.text()).length).toBeGreaterThan(500);
    }

    const sitemap = await (await fetch(`${baseUrl}/sitemap.xml`)).text();
    expect(sitemap).toContain('https://snowye.dev/privacy');
    expect(sitemap).toContain('https://snowye.dev/pt/privacy');
  });

  test('publishes complete contact and address organization schema', async () => {
    const html = await (await fetch(`${baseUrl}/`)).text();
    const scripts = [
      ...html.matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
      )
    ].map(match => JSON.parse(match[1]));
    const graph = scripts.find(value =>
      value['@graph']?.some(
        (node: Record<string, unknown>) => node['@type'] === 'Organization'
      )
    )['@graph'];
    const organization = graph.find(
      (node: Record<string, unknown>) => node['@type'] === 'Organization'
    );

    expect(organization.contactPoint).toMatchObject({
      '@type': 'ContactPoint',
      contactType: 'professional inquiries',
      email: 'gabriel@snowye.dev',
      telephone: '+55 (47) 98833-0284'
    });
    expect(organization.address).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'Blumenau',
      addressRegion: 'Santa Catarina',
      addressCountry: 'BR'
    });
  });

  test('publishes specific instructions for agents', async () => {
    const response = await fetch(`${baseUrl}/llms.txt`);
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(body).toContain('### When to use MCP');
    expect(body).toContain('### Calling guidance');
    expect(body).toContain('search_resume');
  });
});

describe('machine API contracts', () => {
  test('publishes OpenAPI 3.1 and MCP discovery', async () => {
    const openApiResponse = await fetch(`${baseUrl}/openapi.json`);
    const openApi = await openApiResponse.json();
    expect(openApiResponse.status).toBe(200);
    expect(openApi.openapi).toBe('3.1.0');
    expect(openApi.paths['/api/mcp']).toBeDefined();
    expect(openApi.paths['/.well-known/mcp.json']).toBeDefined();

    const manifest = await (
      await fetch(`${baseUrl}/.well-known/mcp.json`)
    ).json();
    expect(manifest.remotes).toContainEqual({
      type: 'streamable-http',
      url: 'https://snowye.dev/api/mcp'
    });
  });

  test('returns structured JSON for unknown API paths', async () => {
    for (const path of ['/api', '/api/missing']) {
      const response = await fetch(`${baseUrl}${path}`);
      const body = await response.json();
      expect(response.status).toBe(404);
      expect(response.headers.get('content-type')).toContain(
        'application/problem+json'
      );
      expect(body).toMatchObject({
        code: 'API_ROUTE_NOT_FOUND',
        status: 404
      });
      expect(body.resolution).toContain('/openapi.json');
    }
  });

  test('enforces the stateless MCP transport envelope', async () => {
    const getResponse = await fetch(`${baseUrl}/api/mcp`);
    expect(getResponse.status).toBe(405);

    const missingContentType = await fetch(`${baseUrl}/api/mcp`, {
      method: 'POST',
      headers: { accept: 'application/json, text/event-stream' },
      body: '{}'
    });
    expect(missingContentType.status).toBe(415);
    expect((await missingContentType.json()).code).toBe(
      'MCP_CONTENT_TYPE_REQUIRED'
    );

    const missingAccept = await fetch(`${baseUrl}/api/mcp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}'
    });
    expect(missingAccept.status).toBe(406);
    expect((await missingAccept.json()).resolution).toContain('Accept');

    const rejectedQuality = await fetch(`${baseUrl}/api/mcp`, {
      method: 'POST',
      headers: {
        accept: 'application/json;q=0, text/event-stream',
        'content-type': 'application/json'
      },
      body: '{}'
    });
    expect(rejectedQuality.status).toBe(406);

    const invalidContentType = await fetch(`${baseUrl}/api/mcp`, {
      method: 'POST',
      headers: {
        accept: 'application/json, text/event-stream',
        'content-type': 'application/jsonx'
      },
      body: '{}'
    });
    expect(invalidContentType.status).toBe(415);

    const forbiddenGet = await fetch(`${baseUrl}/api/mcp`, {
      headers: { origin: 'https://example.com' }
    });
    expect(forbiddenGet.status).toBe(403);
  });

  test('completes MCP initialization and validates subsequent calls', async () => {
    const transportHeaders = {
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json'
    };
    const initialize = await fetch(`${baseUrl}/api/mcp`, {
      method: 'POST',
      headers: transportHeaders,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-06-18',
          capabilities: {},
          clientInfo: { name: 'agent-readiness-test', version: '1.0.0' }
        }
      })
    });
    const initialization = await initialize.json();
    expect(initialize.status).toBe(200);
    expect(initialization.result.protocolVersion).toBe('2025-06-18');

    const headers = {
      ...transportHeaders,
      'mcp-protocol-version': '2025-06-18'
    };
    const tools = await fetch(`${baseUrl}/api/mcp`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      })
    });
    expect((await tools.json()).result.tools.length).toBeGreaterThan(0);

    const invalidToolCall = await fetch(`${baseUrl}/api/mcp`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: 'search_resume', arguments: {} }
      })
    });
    const invalidBody = await invalidToolCall.json();
    expect(invalidBody.error.code).toBe(-32602);
    expect(invalidBody.error.data.reason).toContain('query');

    const initialized = await fetch(`${baseUrl}/api/mcp`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'notifications/initialized'
      })
    });
    expect(initialized.status).toBe(202);
    expect(await initialized.text()).toBe('');

    const clientResponse = await fetch(`${baseUrl}/api/mcp`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        result: { accepted: true }
      })
    });
    expect(clientResponse.status).toBe(202);
    expect(await clientResponse.text()).toBe('');
  });
});
