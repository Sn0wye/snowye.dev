import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Base } from '@/components/base';
import { type AppLocale, routing } from '@/i18n/routing';
import { getT } from '@/i18n/server-t';
import { stripHtml } from '@/utils/stripHtml';
import { ContactForm } from './contact-form';

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
        <p dangerouslySetInnerHTML={{ __html: t.pages.contact.description }} />
        <h2>{t.pages.contact.email}</h2>
        <ContactForm />
      </div>
    </Base>
  );
}
