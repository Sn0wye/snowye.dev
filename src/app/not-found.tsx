import { headers } from 'next/headers';

import { NotFoundView } from '@/components/shell/not-found-view';
import { getMessages } from '@/i18n/messages';

// Catches any unmatched route, including unknown paths under /pt.
// The proxy sets x-site-locale from the path (/pt/... → pt, else en),
// so the page speaks the visitor's language; English is the default.
export default async function GlobalNotFound() {
  const locale = (await headers()).get('x-site-locale') === 'pt' ? 'pt' : 'en';
  const t = getMessages(locale);
  const n = t.pages.notFound;
  const prefix = locale === 'pt' ? '/pt' : '';

  return (
    <NotFoundView
      badge={n.badge}
      title={n.title}
      description={n.description}
      cta={{ label: n.cta, href: prefix || '/' }}
      linksLabel={n.linksLabel}
      destinations={[
        { label: t.common.navbar.about, href: `${prefix}/about` },
        { label: n.links.projects, href: `${prefix}/projects` },
        { label: 'CV', href: `${prefix}/cv` },
        { label: n.links.contact, href: `${prefix}/contact` },
        { label: n.links.sitemap, href: '/sitemap.xml' },
        { label: n.links.agents, href: '/llms.txt' }
      ]}
    />
  );
}
