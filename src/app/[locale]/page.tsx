import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { WebPageJsonLd } from '@/components/web-page-json-ld';
import { getResume } from '@/data/resume';
import {
  getSignatureSkills,
  getSkillUsage,
  isOpenToWork,
  rolesByRecency
} from '@/data/resume-derived';
import { TARGET_STACK } from '@/data/target-stack';
import { Link } from '@/i18n/navigation';
import { type AppLocale, routing } from '@/i18n/routing';
import { getT } from '@/i18n/server-t';
import { IdentityColumn } from './identity-column';
import { WorkAndStack } from './work-and-stack';

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

  return {
    title: t.pages.home.title,
    description: t.pages.home.metaDescription,
    openGraph: {
      type: 'profile',
      description: t.pages.home.metaDescription,
      images: [
        {
          url: '/static/images/me.jpeg',
          width: 336,
          height: 336,
          alt: 'Gabriel Trzimajewski'
        }
      ]
    }
  };
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getT();
  const home = t.pages.home;

  const resume = getResume(locale);
  const skills = getSignatureSkills(locale);
  const roles = rolesByRecency(resume).map(work => ({
    company: work.name,
    position: work.position,
    startDate: work.startDate,
    endDate: work.endDate
  }));

  const sections = [
    { id: 'intro', label: home.nav.intro },
    { id: 'work', label: home.nav.work },
    { id: 'stack', label: home.nav.stack },
    { id: 'approach', label: home.nav.approach },
    { id: 'pages', label: home.nav.pages }
  ];

  const pages = [
    { label: t.common.navbar.about, href: '/about' },
    { label: t.common.navbar.projects, href: '/projects' },
    { label: 'CV', href: '/cv' },
    { label: t.common.navbar.mcp, href: '/mcp' },
    { label: t.common.navbar.contact, href: '/contact' }
  ] as const;

  return (
    <div className="min-h-svh w-full flex-1 text-[15px] leading-[1.7]">
      <WebPageJsonLd
        locale={locale}
        path="/"
        type="ProfilePage"
        name={home.title}
        description={home.metaDescription}
      />
      <div className="mx-auto max-w-6xl px-6 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20 lg:px-12">
        <IdentityColumn
          name={resume.basics.name}
          tagline={home.description}
          role={resume.basics.label}
          city={resume.basics.location.city}
          openSignal={isOpenToWork(resume) ? home.openSignal : null}
          pronunciation={t.pages.about.pronunciation}
          sections={sections}
          copy={{ localTime: home.localTime, timeDiff: home.timeDiff }}
        />

        {/* The bottom padding lets the last section scroll up to the nav's
            parking line, so every section can become active. */}
        <main className="space-y-24 pt-16 pb-40 lg:pt-24 lg:pb-[60vh]">
          <section id="intro" className="scroll-mt-24">
            <h2 className="mb-4 text-[13px] text-primary lg:sr-only">
              {home.nav.intro}
            </h2>
            <p className="text-[1.0625rem] leading-[1.75] text-primary/80">
              {home.introduction}
            </p>
          </section>

          <WorkAndStack
            roles={roles}
            skills={skills}
            pinnedSkills={TARGET_STACK.length}
            usage={getSkillUsage(locale, skills)}
            copy={{
              work: home.nav.work,
              stack: home.nav.stack,
              timeline: home.timeline,
              ...home.stack
            }}
          />

          <section id="approach" className="scroll-mt-24">
            <h2 className="mb-4 text-[13px] text-primary lg:sr-only">
              {home.nav.approach}
            </h2>
            <details className="group">
              <summary className="flex w-fit cursor-pointer list-none items-center gap-2 text-primary transition-opacity hover:opacity-80 [&::-webkit-details-marker]:hidden">
                <ChevronRight
                  aria-hidden
                  className="size-4 text-secondary transition-transform duration-200 group-open:rotate-90"
                />
                {home.detailsLabel}
              </summary>
              <div className="mt-8 space-y-8 border-white/10 border-l pl-6">
                {home.sections.map(section => (
                  <div key={section.title}>
                    <h3 className="font-medium text-primary">
                      {section.title}
                    </h3>
                    <p className="mt-2">{section.body}</p>
                  </div>
                ))}
              </div>
            </details>
          </section>

          <section id="pages" className="scroll-mt-24">
            <h2 className="mb-4 text-[13px] text-primary lg:sr-only">
              {home.nav.pages}
            </h2>
            <ul className="-mx-4">
              {pages.map(page => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="group flex items-baseline justify-between rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.03]"
                  >
                    <span className="text-primary">{page.label}</span>
                    <span className="text-[13px] text-secondary/50 transition-colors group-hover:text-secondary">
                      {page.href}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
