import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import ClientOpenCommandPalette from '@/components/client-open-command-palette';
import { type AppLocale, routing } from '@/i18n/routing';
import { getT } from '@/i18n/server-t';
import { Typewriter } from './typewriter';

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
    description: t.pages.home.description,
    openGraph: {
      description: t.pages.home.description
    }
  };
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getT();

  return (
    <div className="mx-auto flex max-w-3xl flex-1 items-center overflow-hidden px-5 py-navHeightMobile md:w-[800px] md:px-0 md:py-navHeightDesktop">
      <main className="relative z-10 h-full bg-transparent px-5 leading-8 text-secondary">
        <h1 className="bg-linear-to-r from-[#9442FE] to-[#3378FF] bg-clip-text text-transparent">
          {t.pages.home.title}
        </h1>
        <div className="flex flex-col">
          <strong dangerouslySetInnerHTML={{ __html: t.pages.home.meta }} />
          <Typewriter strings={t.pages.home.description} />
        </div>
        <ClientOpenCommandPalette />
      </main>
    </div>
  );
}
