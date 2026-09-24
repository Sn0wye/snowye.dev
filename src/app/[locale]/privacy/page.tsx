import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/shell/page-shell';
import { Section } from '@/components/shell/section';
import { WebPageJsonLd } from '@/components/web-page-json-ld';
import { type AppLocale, routing } from '@/i18n/routing';
import { getT } from '@/i18n/server-t';

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
    title: t.pages.privacy.title,
    description: t.pages.privacy.metaDescription,
    alternates: {
      canonical: `${localePath}/privacy`,
      languages: {
        en: '/privacy',
        pt: '/pt/privacy'
      }
    },
    openGraph: {
      description: t.pages.privacy.metaDescription,
      url: `${localePath}/privacy`
    }
  };
}

export default async function Privacy({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getT();
  const p = t.pages.privacy;

  return (
    <PageShell current="/privacy" title={p.navLabel} tagline={p.tagline}>
      <WebPageJsonLd
        locale={locale}
        path="/privacy"
        type="WebPage"
        name={p.title}
        description={p.metaDescription}
      />
      <p className="mt-6 text-[13px] text-secondary/60">{p.updated}</p>

      <div className="mt-16">
        {p.sections.map(section => (
          <Section key={section.title} title={section.title}>
            <p className="max-w-2xl">{section.body}</p>
          </Section>
        ))}
      </div>
    </PageShell>
  );
}
