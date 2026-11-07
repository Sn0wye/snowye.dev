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
