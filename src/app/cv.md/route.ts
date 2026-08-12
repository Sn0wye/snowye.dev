import { renderResumeMarkdown } from '@/data/resume-markdown';

export const dynamic = 'force-static';

export function GET() {
  return new Response(renderResumeMarkdown('en'), {
    headers: { 'content-type': 'text/markdown; charset=utf-8' }
  });
}
