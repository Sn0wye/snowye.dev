import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { type AppLocale, routing } from '@/i18n/routing';
import { findMoment, findProject, moments } from '@/motion/registry';
import { CraftIndex } from '../craft-index';

export function generateStaticParams() {
  return routing.locales.flatMap(locale =>
    moments.map(moment => ({ locale, slug: moment.slug }))
  );
}

type PageProps = {
  params: Promise<{ locale: AppLocale; slug: string }>;
};

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const moment = findMoment(slug);
  if (!moment) return {};
  const project = findProject(moment.project);
  const localePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: `${moment.title[locale]} · ${project?.name} | Gabriel Trzimajewski`,
    description: moment.summary[locale],
    openGraph: {
      description: moment.summary[locale],
      url: `${localePath}/craft/${slug}`
    }
  };
}

/** A moment's own URL: the craft page with that moment open. */
export default async function MomentPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!findMoment(slug)) notFound();
  return <CraftIndex locale={locale} />;
}
