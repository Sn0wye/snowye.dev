import type { AppLocale } from '@/i18n/routing';

const SITE_URL = 'https://snowye.dev';

type WebPageJsonLdProps = {
  locale: AppLocale;
  /** Path without locale prefix, e.g. `/about`. Use `/` for the home page. */
  path: string;
  name: string;
  description: string;
  /** Use ProfilePage for pages that are primarily about the person. */
  type?: 'WebPage' | 'ProfilePage' | 'CollectionPage' | 'ContactPage';
};

/**
 * Per-page WebPage node, wired back into the site graph.
 *
 * Without this, crawlers see a domain-level entity but no per-URL subject,
 * which is what makes extraction/citation of an individual page unreliable.
 */
export const WebPageJsonLd = ({
  locale,
  path,
  name,
  description,
  type = 'WebPage'
}: WebPageJsonLdProps) => {
  const localePath = locale === 'en' ? '' : `/${locale}`;
  const url = `${SITE_URL}${localePath}${path === '/' ? '' : path}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: locale === 'pt' ? 'pt-BR' : 'en-US',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#gabriel` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    primaryImageOfPage: { '@id': `${SITE_URL}/#logo` }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};
