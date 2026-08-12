import { renderResumeMarkdown } from '@/data/resume-markdown';

export const dynamic = 'force-static';

/**
 * Explicit route: the locale proxy skips paths containing a dot, so `/pt/cv.md`
 * never gets rewritten to `/[locale]/cv.md`.
 */
export function GET() {
  return new Response(renderResumeMarkdown('pt'), {
    headers: { 'content-type': 'text/markdown; charset=utf-8' }
  });
}
