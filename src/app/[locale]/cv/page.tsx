import { format } from 'date-fns';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { OpenSignal } from '@/components/shell/open-signal';
import { PageShell } from '@/components/shell/page-shell';
import { Section } from '@/components/shell/section';
import { WebPageJsonLd } from '@/components/web-page-json-ld';
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
    <PageShell
      current="/cv"
      title={resume.basics.name}
      tagline={resume.basics.label}
    >
      <WebPageJsonLd
        locale={locale}
        path="/cv"
        type="ProfilePage"
        name={c.title}
        description={c.description}
      />

      <div className="mt-6 max-w-2xl space-y-3">
        <p>
          <strong className="font-normal text-primary">
            {resume.basics.name}
          </strong>{' '}
          — {resume.basics.label}, {resume.basics.location.city},{' '}
          {resume.basics.location.region}, {resume.basics.location.countryCode}.
        </p>
        {isOpenToWork(resume) && (
          <OpenSignal label={c.openToWork} className="text-primary/80" />
        )}
      </div>

      <div className="mt-20">
        <Section title={c.sections.summary}>
          <p className="max-w-2xl">{resume.basics.summary}</p>
        </Section>

        <Section title={c.sections.skills}>
          <ul className="flex max-w-2xl flex-wrap gap-x-2 gap-y-1">
            {getSignatureSkills(locale).map((skill, i, all) => (
              <li key={skill}>
                <span className="text-primary">{skill}</span>
                {i < all.length - 1 && (
                  <span aria-hidden className="text-white/20">
                    {' '}
                    /
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Section>

        <Section title={c.sections.experience}>
          <div className="max-w-2xl space-y-14">
            {roles.map(role => {
              const end = roleEnd(role);
              // Self-contained third-person sentence: an answer engine can
              // quote this verbatim, where a bare "Apr 2025 – Jun 2026" would
              // have to be guessed at.
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
                <article key={`${role.name}-${role.startDate}`}>
                  <h3 className="text-primary">
                    {role.position},{' '}
                    {role.url ? (
                      <a
                        href={role.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white/70"
                      >
                        {role.name}
                      </a>
                    ) : (
                      role.name
                    )}
                  </h3>
                  <p className="mt-1 text-[14px] text-secondary/70">
                    {sentence}
                  </p>
                  {role.summary && <p className="mt-4">{role.summary}</p>}
                  <div className="mt-4">
                    <Highlights
                      id={`${role.name}-${role.startDate}`
                        .toLowerCase()
                        .replace(/\W+/g, '-')}
                      items={role.highlights}
                      showAll={c.showAll}
                      showLess={c.showLess}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </Section>

        <Section title={c.sections.education}>
          {resume.education.map(item => (
            <article key={item.institution} className="max-w-2xl">
              <h3 className="text-primary">
                {item.studyType}, {item.area}
              </h3>
              <p className="mt-1">
                {interpolate(c.sentence.education, {
                  name: resume.basics.name,
                  area: item.area,
                  institution: item.institution,
                  start: item.startDate,
                  end: item.endDate ?? c.present,
                  score: item.score ?? '—'
                })}
              </p>
              {item.courses.length > 0 && (
                <p className="mt-3 text-[14px] text-secondary/70">
                  {item.courses.join(', ')}
                </p>
              )}
            </article>
          ))}
        </Section>

        <Section title={c.sections.languages}>
          <ul className="space-y-1">
            {resume.languages.map(language => (
              <li key={language.language}>
                <span className="text-primary">{language.language}</span>,{' '}
                {language.fluency}
              </li>
            ))}
          </ul>
        </Section>

        <Section title={c.sections.contact}>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            <li>
              <a
                href={`mailto:${resume.basics.email}`}
                className="text-primary underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white/70"
              >
                {resume.basics.email}
              </a>
            </li>
            {resume.basics.profiles.map(profile => (
              <li key={profile.url}>
                <a
                  href={profile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white/70"
                >
                  {profile.network}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </PageShell>
  );
}
