export const mcp = {
  title: 'MCP | Gabriel Trzimajewski',
  tagline: 'Ask an agent about me.',
  description:
    'This site runs a <strong>Model Context Protocol</strong> server. Point any MCP client at it and your assistant can answer questions about my experience, stack and projects from the <strong>same source that renders my CV</strong> — no scraping, no stale copies.',
  connect: 'Connect',
  connectDescription:
    'Streamable HTTP, no authentication, no session to keep. Add this to your client config:',
  discovery: 'Autodiscovery',
  discoveryDescription:
    'Clients that only know the domain can find the server and its tools here:',
  tools: 'Tools',
  toolsDescription:
    'Every tool is a pure function of my résumé source, so nothing here can drift from the CV page.',
  tryIt: 'Try it',
  tryItDescription: 'Or call it directly over curl:',
  alsoFor: 'Not using MCP?',
  alsoForDescription:
    'The same facts are served as plain text and Markdown: <a href="/llms.txt">llms.txt</a>, <a href="/cv.md">cv.md</a>, and the <a href="/cv">CV page</a> with schema.org markup.'
};
