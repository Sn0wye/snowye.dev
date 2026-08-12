import { format } from 'date-fns';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Base } from '@/components/base';
import { PersonJsonLd } from '@/components/person-json-ld';
import { getResume } from '@/data/resume';
import {
  getSignatureSkills,
  isOpenToWork,
  parseMonth,
  roleEnd,
  rolesByRecency
} from '@/data/resume-derived';
import { type AppLocale, routing } from '@/i18n/routing';
import { getT } from '@/i18n/server-t';
import { dateFnsLocaleFor } from '@/utils/getDurationString';
import { interpolate } from '@/utils/interpolate';
import { Highlights } from './highlights';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

type PageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getT();
  const localePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: t.pages.cv.title,
    description: t.pages.cv.description,
    alternates: { canonical: `${localePath}/cv` },
    openGraph: {
      title: t.pages.cv.title,
      description: t.pages.cv.description,
      url: `${localePath}/cv`,
      images: [{ url: '/static/images/me.jpeg' }]
    }
  };
}

export default async function CV({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getT();
  const c = t.pages.cv;
  const resume = getResume(locale);
  const dfLocale = dateFnsLocaleFor(locale);
  const roles = rolesByRecency(resume);

  const month = (value: string, endOfMonth = false) =>
    format(parseMonth(value, endOfMonth), 'LLLL yyyy', { locale: dfLocale });

  return (
    <Base
      tagline={c.tagline}
      title={c.title}
      primaryColor="cyan"
      secondaryColor="purple"
    >
      <PersonJsonLd locale={locale} />

      <p>
        <strong>{resume.basics.name}</strong> — {resume.basics.label},{' '}
        {resume.basics.location.city}, {resume.basics.location.region},{' '}
        {resume.basics.location.countryCode}.
      </p>

      {isOpenToWork(resume) && <p>{c.openToWork}</p>}

      <h2>{c.sections.summary}</h2>
      <p>{resume.basics.summary}</p>

      <h2>{c.sections.skills}</h2>
      <p>{getSignatureSkills(locale).join(' · ')}</p>

      <h2>{c.sections.experience}</h2>
      {roles.map(role => {
        const end = roleEnd(role);
        // Self-contained third-person sentence: an answer engine can quote this
        // verbatim, where a bare "Apr 2025 – Jun 2026" would have to be guessed at.
        const sentence = interpolate(
          end ? c.sentence.role : c.sentence.currentRole,
          {
            name: resume.basics.name,
            position: role.position,
            company: role.name,
            start: month(role.startDate),
            end: role.endDate ? month(role.endDate, true) : c.present
          }
        );

        return (
          <article
            style={{ marginBottom: 40 }}
            key={`${role.name}-${role.startDate}`}
          >
            <h3>
              {role.position} —{' '}
              {role.url ? (
                <a href={role.url} target="_blank" rel="noreferrer">
                  {role.name}
                </a>
              ) : (
                role.name
              )}
            </h3>
            <p style={{ margin: 0 }}>{sentence}</p>
            {role.summary && <p>{role.summary}</p>}
            <Highlights
              id={`${role.name}-${role.startDate}`
                .toLowerCase()
                .replace(/\W+/g, '-')}
              items={role.highlights}
              showAll={c.showAll}
              showLess={c.showLess}
            />
          </article>
        );
      })}

      <h2>{c.sections.education}</h2>
      {resume.education.map(item => (
        <article style={{ marginBottom: 40 }} key={item.institution}>
          <h3>
            {item.studyType} — {item.area}
          </h3>
          <p style={{ margin: 0 }}>
            {interpolate(c.sentence.education, {
              name: resume.basics.name,
              area: item.area,
              institution: item.institution,
              start: item.startDate,
              end: item.endDate ?? c.present,
              score: item.score ?? '—'
            })}
          </p>
          {item.courses.length > 0 && <p>{item.courses.join(' · ')}</p>}
        </article>
      ))}

      <h2>{c.sections.languages}</h2>
      <ul>
        {resume.languages.map(language => (
          <li key={language.language}>
            <strong>{language.language}</strong> — {language.fluency}
          </li>
        ))}
      </ul>

      <h2>{c.sections.contact}</h2>
      <ul>
        <li>
          <a href={`mailto:${resume.basics.email}`}>{resume.basics.email}</a>
        </li>
        {resume.basics.profiles.map(profile => (
          <li key={profile.url}>
            <a href={profile.url} target="_blank" rel="noreferrer">
              {profile.network}
            </a>
          </li>
        ))}
      </ul>
    </Base>
  );
}
