import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

type MediaRange = {
  type: string;
  subtype: string;
  quality: number;
  index: number;
};

const parseAccept = (header: string): MediaRange[] =>
  header.split(',').map((part, index) => {
    const [mediaType = '', ...parameters] = part
      .trim()
      .toLowerCase()
      .split(';');
    const [type = '', subtype = ''] = mediaType.split('/');
    const qualityValue = parameters
      .map(parameter => /^q\s*=\s*(.*)$/.exec(parameter.trim())?.[1])
      .find(value => value !== undefined);
    const validQuality =
      qualityValue === undefined ||
      /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(qualityValue);
    const quality = validQuality ? Number(qualityValue ?? 1) : 0;

    return { type, subtype, quality, index };
  });

const qualityFor = (mediaType: string, ranges: MediaRange[]): number => {
  const [type, subtype] = mediaType.split('/');
  const matches = ranges
    .filter(
      range =>
        (range.type === '*' || range.type === type) &&
        (range.subtype === '*' || range.subtype === subtype)
    )
    .sort((left, right) => {
      const specificity = (range: MediaRange) =>
        range.type === '*' ? 0 : range.subtype === '*' ? 1 : 2;
      return specificity(right) - specificity(left) || left.index - right.index;
    });

  return matches[0]?.quality ?? 0;
};

const appendVaryAccept = (response: NextResponse) => {
  const vary = response.headers.get('vary');
  const values = new Set(
    (vary ? vary.split(',') : []).map(value => value.trim()).filter(Boolean)
  );
  values.add('Accept');
  response.headers.set('vary', [...values].join(', '));
  return response;
};

const isHomepage = (pathname: string) =>
  pathname === '/' ||
  pathname === '/en' ||
  pathname === '/en/' ||
  pathname === '/pt' ||
  pathname === '/pt/';

const PAGE_PATHS = new Set([
  '',
  '/about',
  '/contact',
  '/cv',
  '/mcp',
  '/privacy',
  '/projects'
]);

const isKnownPage = (pathname: string) => {
  const withoutTrailingSlash =
    pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const withoutLocale = withoutTrailingSlash.replace(
    /^\/(?:en|pt)(?=\/|$)/,
    ''
  );
  return PAGE_PATHS.has(withoutLocale === '/' ? '' : withoutLocale);
};

const prefersMarkdown = (ranges: MediaRange[]) => {
  const markdownQuality = qualityFor('text/markdown', ranges);
  const htmlQuality = qualityFor('text/html', ranges);
  const explicitlyAcceptsMarkdown = ranges.some(
    range =>
      range.type === 'text' && range.subtype === 'markdown' && range.quality > 0
  );
  const explicitlyAcceptsHtml = ranges.some(
    range =>
      range.type === 'text' && range.subtype === 'html' && range.quality > 0
  );

  return (
    markdownQuality > htmlQuality ||
    (markdownQuality === htmlQuality &&
      explicitlyAcceptsMarkdown &&
      !explicitlyAcceptsHtml)
  );
};

export default function proxy(request: NextRequest) {
  const locale =
    request.nextUrl.pathname === '/pt' ||
    request.nextUrl.pathname.startsWith('/pt/')
      ? 'pt'
      : 'en';
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-site-locale', locale);
  const accept = request.headers.get('accept') ?? '*/*';
  const ranges = parseAccept(accept);

  if (!isKnownPage(request.nextUrl.pathname) && prefersMarkdown(ranges)) {
    const prefix = locale === 'pt' ? '/pt' : '';
    const body =
      locale === 'pt'
        ? `# 404 — Página não encontrada

O caminho solicitado não existe ou foi movido.

- [Página inicial](https://snowye.dev${prefix})
- [Mapa do site](https://snowye.dev/sitemap.xml)
- [Instruções para agentes](https://snowye.dev/llms.txt)
- [Currículo em Markdown](https://snowye.dev${prefix}/cv.md)
`
        : `# 404 — Page not found

The requested path does not exist or may have moved.

- [Homepage](https://snowye.dev/)
- [Sitemap](https://snowye.dev/sitemap.xml)
- [Agent instructions](https://snowye.dev/llms.txt)
- [CV in Markdown](https://snowye.dev/cv.md)
`;

    return new NextResponse(body, {
      status: 404,
      headers: {
        'content-language': locale === 'pt' ? 'pt-BR' : 'en-US',
        'content-type': 'text/markdown; charset=utf-8',
        vary: 'Accept'
      }
    });
  }

  if (isHomepage(request.nextUrl.pathname)) {
    const markdownQuality = qualityFor('text/markdown', ranges);
    const htmlQuality = qualityFor('text/html', ranges);

    if (markdownQuality === 0 && htmlQuality === 0) {
      return new NextResponse('Not Acceptable', {
        status: 406,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          vary: 'Accept'
        }
      });
    }

    if (prefersMarkdown(ranges)) {
      const destination = request.nextUrl.clone();
      destination.pathname = '/markdown/home';
      destination.search = `?locale=${locale}`;
      return appendVaryAccept(
        NextResponse.rewrite(destination, {
          request: { headers: requestHeaders }
        })
      );
    }
  }

  // Passing the locale header through next-intl lets the root layout set the
  // raw document language without nesting a second <html> element.
  const response = handleI18nRouting(
    new NextRequest(request.url, {
      method: request.method,
      headers: requestHeaders
    })
  );

  if (isHomepage(request.nextUrl.pathname)) {
    return appendVaryAccept(response);
  }

  return response;
}

export const config = {
  // Match all routes except API, static files, _next, _vercel and the email API.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
