import { getResume } from '@/data/resume';
import type { AppLocale } from '@/i18n/routing';

const SITE_URL = 'https://snowye.dev';

/**
 * Site-wide entity graph: Organization + WebSite.
 *
 * Answer engines (Google AI Overviews in particular) use the Organization
 * node — name, logo, sameAs — as the E-E-A-T authority signal for every page
 * on the domain, so this renders once in the locale layout rather than
 * per page.
 */
export const SiteJsonLd = ({ locale }: { locale: AppLocale }) => {
  const resume = getResume(locale);
  const sameAs = resume.basics.profiles.map(profile => profile.url);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: resume.basics.name,
        alternateName: 'Snowye',
        url: SITE_URL,
        email: `mailto:${resume.basics.email}`,
        description: resume.basics.summary,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'professional inquiries',
          email: resume.basics.email,
          telephone: resume.basics.phone
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Blumenau',
          addressRegion: 'Santa Catarina',
          addressCountry: 'BR'
        },
        logo: {
          '@type': 'ImageObject',
          '@id': `${SITE_URL}/#logo`,
          url: `${SITE_URL}/static/images/me.jpeg`,
          contentUrl: `${SITE_URL}/static/images/me.jpeg`,
          width: 336,
          height: 336,
          caption: resume.basics.name
        },
        image: { '@id': `${SITE_URL}/#logo` },
        founder: { '@id': `${SITE_URL}/#gabriel` },
        sameAs
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: resume.basics.name,
        description: resume.basics.summary,
        inLanguage: locale === 'pt' ? 'pt-BR' : 'en-US',
        publisher: { '@id': `${SITE_URL}/#organization` }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replaceAll('<', '\\u003c')
      }}
    />
  );
};
