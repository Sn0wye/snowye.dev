import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Base } from '@/components/base';
import { Button } from '@/components/button';
import { WebPageJsonLd } from '@/components/web-page-json-ld';
import { type AppLocale, routing } from '@/i18n/routing';
import { getT } from '@/i18n/server-t';
import { stripHtml } from '@/utils/stripHtml';

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
    description: stripHtml(t.pages.contact.description),
    openGraph: {
      description: stripHtml(t.pages.contact.description),
      url: `${localePath}/contact`
    }
  };
}

export default async function Contact({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getT();

  const meta = {
    primaryColor: 'purple',
    secondaryColor: 'cyan'
  } as const;

  return (
    <Base
      primaryColor={meta.primaryColor}
      secondaryColor={meta.secondaryColor}
      title={t.pages.contact.title}
      tagline={t.pages.contact.tagline}
    >
      <div>
        <WebPageJsonLd
          locale={locale}
          path="/contact"
          type="ContactPage"
          name={t.pages.contact.title}
          description={stripHtml(t.pages.contact.description)}
        />
        <p dangerouslySetInnerHTML={{ __html: t.pages.contact.description }} />
        <h2>{t.pages.contact.book}</h2>
        <Button
          asChild
          className="mt-5! border transition-colors hover:border-white hover:bg-transparent hover:text-white"
        >
          <a href={CAL_URL} target="_blank" rel="noreferrer noopener">
            {t.pages.contact.cta}
          </a>
        </Button>
      </div>
    </Base>
  );
}
