import { getResume } from '@/data/resume';
import { getKnownForSet, rolesByRecency } from '@/data/resume-derived';
import type { AppLocale } from '@/i18n/routing';

/**
 * Publishes the résumé as a schema.org Person graph.
 *
 * This is what lets a search or answer engine merge snowye.dev, LinkedIn and
 * GitHub into one entity rather than three competing pages, via `sameAs`.
 */
export const PersonJsonLd = ({ locale }: { locale: AppLocale }) => {
  const resume = getResume(locale);
  const roles = rolesByRecency(resume);
  const education = resume.education[0];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://snowye.dev/#gabriel',
    name: resume.basics.name,
    jobTitle: resume.basics.label,
    description: resume.basics.summary,
    email: `mailto:${resume.basics.email}`,
    url: 'https://snowye.dev',
    image: 'https://snowye.dev/static/images/me.jpeg',
    address: {
      '@type': 'PostalAddress',
      addressLocality: resume.basics.location.city,
      addressRegion: resume.basics.location.region,
      addressCountry: resume.basics.location.countryCode
    },
    sameAs: resume.basics.profiles.map(profile => profile.url),
    // Breadth is fine here: no human reads it, and it aids entity matching.
    knowsAbout: getKnownForSet(locale),
    knowsLanguage: resume.languages.map(language => language.language),
    alumniOf: education && {
      '@type': 'EducationalOrganization',
      name: education.institution
    },
    hasOccupation: roles.map(role => ({
      '@type': 'EmployeeRole',
      roleName: role.position,
      startDate: role.startDate,
      ...(role.endDate ? { endDate: role.endDate } : {}),
      worksFor: {
        '@type': 'Organization',
        name: role.name,
        ...(role.url ? { url: role.url } : {})
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};
