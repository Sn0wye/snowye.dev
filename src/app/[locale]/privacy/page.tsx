import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Base } from '@/components/base';
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

  return (
    <Base
      primaryColor="purple"
      secondaryColor="cyan"
      title={t.pages.privacy.title}
      tagline={t.pages.privacy.tagline}
    >
      <WebPageJsonLd
        locale={locale}
        path="/privacy"
        type="WebPage"
        name={t.pages.privacy.title}
        description={t.pages.privacy.metaDescription}
      />
      <p className="mb-8 text-sm">{t.pages.privacy.updated}</p>
      <div className="space-y-8">
        {t.pages.privacy.sections.map(section => (
          <section key={section.title}>
            <h2 className="mb-2 text-primary text-xl">{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </Base>
  );
}
