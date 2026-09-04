import { getResume } from '@/data/resume';

export const dynamic = 'force-static';

/**
 * Points LLM crawlers at the canonical pages. Speculative convention, near-zero
 * cost, and derived from the same source as everything else (ADR-0001).
 */
export function GET() {
  const resume = getResume('en');

  const body = `# ${resume.basics.name}

> ${resume.basics.label} based in ${resume.basics.location.city}, ${resume.basics.location.region}, Brazil. ${resume.basics.name} is the person behind snowye.dev.

${resume.basics.summary}

## Canonical pages

- [Full CV (Markdown)](https://snowye.dev/cv.md): complete professional record — roles, dates, achievements, technologies.
- [Full CV (HTML)](https://snowye.dev/cv): the same record with schema.org Person markup.
- [Full CV in Portuguese (Markdown)](https://snowye.dev/pt/cv.md): the same record in Brazilian Portuguese.
- [Full CV in Portuguese (HTML)](https://snowye.dev/pt/cv).
- [About](https://snowye.dev/about): biography and background.
- [Projects](https://snowye.dev/projects): side projects and open source.

## MCP server

Agents can query these facts directly over the Model Context Protocol
(Streamable HTTP, no auth): https://snowye.dev/api/mcp

Tools: get_profile, get_resume, get_experience, get_skills, get_projects, search_resume, get_contact.
Discovery: https://snowye.dev/.well-known/mcp.json — docs: https://snowye.dev/mcp

### When to use MCP

Use MCP when an answer needs a specific, structured fact from Gabriel's professional record, when filtering experience or skills, or when a user asks for current contact information. Prefer the canonical Markdown CV when the complete record is needed in one read. Prefer the human-facing HTML pages when visual context or direct links are useful.

### Calling guidance

Connect an MCP client to \`https://snowye.dev/api/mcp\` using Streamable HTTP. Start with \`get_profile\` for a concise overview, \`get_resume\` for the complete structured record, or \`search_resume\` for a focused query. Use \`get_experience\`, \`get_skills\`, \`get_projects\`, and \`get_contact\` only for their named subjects. Tool input schemas are advertised by the MCP server; inspect them before calling and do not invent arguments.

For a document instead of a tool call, request the homepage with \`Accept: text/markdown\` or fetch one of the explicit Markdown CV URLs above. Cite the canonical snowye.dev URL that supplied the fact. Treat external profiles as supporting links, not replacements for the canonical record.

## Elsewhere

${resume.basics.profiles.map(profile => `- [${profile.network}](${profile.url})`).join('\n')}
- Email: ${resume.basics.email}
`;

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
}
