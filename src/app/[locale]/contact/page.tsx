import { ArrowUpRight, CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { LocalTime } from '@/components/shell/local-time';
import { PageShell } from '@/components/shell/page-shell';
import { richText } from '@/components/shell/section';
import { Specimen } from '@/components/shell/specimen';
import { WebPageJsonLd } from '@/components/web-page-json-ld';
import { getResume } from '@/data/resume';
import { type AppLocale, routing } from '@/i18n/routing';
import { getT } from '@/i18n/server-t';
import { cn } from '@/lib/cn';
import { CopyEmailTile } from './copy-email-tile';

const CAL_URL = 'https://cal.com/trzimajewski';

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
    title: t.pages.contact.title,
    description: t.pages.contact.metaDescription,
    openGraph: {
      description: t.pages.contact.metaDescription,
      url: `${localePath}/contact`
    }
  };
}

export default async function Contact({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getT();
  const c = t.pages.contact;
  const resume = getResume(locale);

  return (
    <PageShell
      current="/contact"
      title={t.common.navbar.contact}
      tagline={c.tagline}
    >
      <WebPageJsonLd
        locale={locale}
        path="/contact"
        type="ContactPage"
        name={c.title}
        description={c.metaDescription}
      />

      <div className="mt-16 grid grid-cols-1 gap-x-5 gap-y-10 text-[14px] sm:grid-cols-2 lg:grid-cols-3">
        <Specimen title={c.book} note={c.cta} href={CAL_URL}>
          <ArrowUpRight
            aria-hidden
            className="absolute top-4 right-4 size-4 text-secondary/40 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
          />
          <span className="flex flex-col items-center gap-4">
            <span className="flex size-10 items-center justify-center rounded-full bg-white/[0.06] text-primary transition-transform duration-300 group-hover:scale-110">
              <CalendarDays aria-hidden className="size-4" />
            </span>
            <span className="text-[1.5rem] font-medium tracking-[-0.03em] text-primary">
              {c.book}
            </span>
          </span>
        </Specimen>

        <CopyEmailTile
          address={resume.basics.email}
          title={c.email}
          copyHint={c.copyHint}
          copied={c.copied}
        />

        <Specimen title={c.localTime} note={c.localTimeNote}>
          <LocalTime
            city={resume.basics.location.city}
            copy={{
              localTime: t.pages.home.localTime,
              timeDiff: t.pages.home.timeDiff
            }}
            className="px-8 text-center text-[1.125rem]"
          />
        </Specimen>
      </div>

      <div
        className={cn('mt-16 max-w-2xl', richText)}
        // The copy ships with <strong>, <a> and <br> markup.
        dangerouslySetInnerHTML={{ __html: c.description }}
      />
    </PageShell>
  );
}
