import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { type AppLocale, routing } from '@/i18n/routing';
import { getT } from '@/i18n/server-t';
import { stripHtml } from '@/utils/stripHtml';
import { CraftIndex } from './craft-index';

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
  const description = stripHtml(t.pages.craft.description);
  const localePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: t.pages.craft.title,
    description,
    openGraph: { description, url: `${localePath}/craft` }
  };
}

export default async function Craft({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CraftIndex locale={locale} />;
}
