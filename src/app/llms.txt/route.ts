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

## Elsewhere

${resume.basics.profiles.map(profile => `- [${profile.network}](${profile.url})`).join('\n')}
- Email: ${resume.basics.email}
`;

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
}
