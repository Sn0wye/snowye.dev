'use client';

import { NotFoundView } from '@/components/shell/not-found-view';
import { routing } from '@/i18n/routing';
import { useAppLocale, useT } from '@/i18n/use-t';

export default function NotFound() {
  const t = useT();
  const n = t.pages.notFound;
  const locale = useAppLocale();
  // localePrefix: 'as-needed' — only non-default locales are prefixed.
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;

  return (
    <NotFoundView
      title={n.title}
      description={n.description}
      whereTo={n.whereTo}
      noMatch={n.noMatch}
      destinations={[
        { label: n.links.home, href: prefix || '/' },
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
