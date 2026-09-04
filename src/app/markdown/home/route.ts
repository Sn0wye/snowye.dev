import { renderHomeMarkdown } from '@/data/home-markdown';
import type { AppLocale } from '@/i18n/routing';

export function GET(request: Request) {
  const requestedLocale =
    request.headers.get('x-site-locale') ??
    new URL(request.url).searchParams.get('locale');
  const locale: AppLocale = requestedLocale === 'pt' ? 'pt' : 'en';

  return new Response(renderHomeMarkdown(locale), {
    headers: {
      'content-language': locale === 'pt' ? 'pt-BR' : 'en-US',
      'content-type': 'text/markdown; charset=utf-8',
      vary: 'Accept'
    }
  });
}
