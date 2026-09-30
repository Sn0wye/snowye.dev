import { format } from 'date-fns';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Faq } from '@/components/faq';
import { PageShell } from '@/components/shell/page-shell';
import { richText, Section } from '@/components/shell/section';
import { WebPageJsonLd } from '@/components/web-page-json-ld';
import { getResume } from '@/data/resume';
import {
  parseMonth,
  roleEnd,
  roleStart,
  rolesByRecency
} from '@/data/resume-derived';
import { env } from '@/env';
import { type AppLocale, routing } from '@/i18n/routing';
import { getT } from '@/i18n/server-t';
import { cn } from '@/lib/cn';
import { dateFnsLocaleFor, getDurationString } from '@/utils/getDurationString';
import { stripHtml } from '@/utils/stripHtml';
import { PhotoStack } from './photo-stack';
import { PronounceSurname } from './pronounce-surname';

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

  // localePrefix: 'as-needed' — only non-default locales are prefixed.
  const localePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    metadataBase:
      env.NODE_ENV === 'production'
        ? new URL('https://snowye.dev')
        : new URL('http://localhost:3000'),
    title: t.pages.about.title,
    description: stripHtml(t.pages.about.description),
    openGraph: {
      description: stripHtml(t.pages.about.description),
      url: `${localePath}/about`,
      images: [
        {
          url: '/static/images/me.jpeg',
          width: 336,
          height: 336
        }
      ]
    }
  };
}

export default async function About({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getT();
  const a = t.pages.about;

  // Facts come from the Résumé Source (ADR-0001); the locale files only
  // carry voice.
  const resume = getResume(locale);
  const dfLocale = dateFnsLocaleFor(locale);
  const month = (value: string) =>
    format(parseMonth(value), 'LLL yyyy', { locale: dfLocale });

  return (
    <PageShell
      current="/about"
      title={t.common.navbar.about}
      tagline={a.tagline}
    >
      <WebPageJsonLd
        locale={locale}
        path="/about"
        type="ProfilePage"
        name={a.title}
        description={stripHtml(a.description)}
      />

      <div className="mt-12 grid gap-12 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-16">
        <div className={cn('max-w-2xl space-y-5', richText)}>
          <p>
            {a.bio.p1Before}
            <strong>
              {a.bio.p1FirstName} <PronounceSurname />
            </strong>
            {/* p1After ships with markup (<strong>, <a>) — render via HTML. */}
            <span dangerouslySetInnerHTML={{ __html: a.bio.p1After }} />
          </p>
          <p dangerouslySetInnerHTML={{ __html: a.bio.p2 }} />
          <p dangerouslySetInnerHTML={{ __html: a.bio.p3 }} />
        </div>
        <div className="md:pt-2">
          <PhotoStack alt={resume.basics.name} />
        </div>
      </div>

      <div className="mt-20">
        <Section title={a.highlights}>
          <ul className={cn('space-y-3', richText)}>
            {a.highlightsList.map(item => (
              <li
                key={item}
                className="relative pl-5 before:absolute before:top-[0.8em] before:left-0 before:h-px before:w-2.5 before:bg-white/25"
                dangerouslySetInnerHTML={{ __html: item }}
              />
            ))}
          </ul>
        </Section>

        <Section title={a.career}>
          <ul className="-mx-4 -mt-3">
            {rolesByRecency(resume).map(role => (
              <li
                key={`${role.name}-${role.startDate}`}
                className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.03] sm:grid-cols-[7.5rem_minmax(0,1fr)_auto]"
              >
                <span className="text-[13px] tabular-nums leading-[1.9] text-secondary/60">
                  {role.startDate.slice(0, 4)} – {role.endDate?.slice(0, 4)}
                </span>
                <span>
                  <span className="block text-primary">{role.name}</span>
                  <span className="block">{role.position}</span>
                </span>
                <span className="col-start-2 text-[13px] text-secondary/60 sm:col-start-auto sm:text-right">
                  {month(role.startDate)} –{' '}
                  {role.endDate ? month(role.endDate) : t.pages.cv.present}
                  <span className="block">
                    {getDurationString(
                      roleStart(role).toISOString(),
                      roleEnd(role)?.toISOString(),
                      locale
                    )}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={a.education}>
          {resume.education.map(item => (
            <div key={item.institution} className="space-y-1">
              <p className="text-primary">
                {item.studyType}, {item.area}
              </p>
              <p>
                {item.institution}, {item.startDate.slice(0, 4)} –{' '}
                {item.endDate?.slice(0, 4) ?? t.pages.cv.present}
                {item.score && `, GPA ${item.score}`}
              </p>
              {item.courses.length > 0 && (
                <p className="pt-2 text-[14px] text-secondary/70">
                  {item.courses.join(', ')}
                </p>
              )}
            </div>
          ))}
        </Section>

        <Faq />

        <Section title={a.languages}>
          <ul className="space-y-1">
            {resume.languages.map(language => (
              <li key={language.language}>
                <span className="text-primary">{language.language}</span>,{' '}
                {language.fluency}
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </PageShell>
  );
}
