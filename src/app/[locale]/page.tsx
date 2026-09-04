import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import ClientOpenCommandPalette from '@/components/client-open-command-palette';
import { WebPageJsonLd } from '@/components/web-page-json-ld';
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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 px-5 py-nav-height-mobile md:w-[800px] md:px-0 md:py-nav-height-desktop">
      <WebPageJsonLd
        locale={locale}
        path="/"
        type="ProfilePage"
        name={t.pages.home.title}
        description={t.pages.home.metaDescription}
      />
      <main className="relative z-10 w-full bg-transparent px-5 leading-8 text-secondary">
        <section className="flex min-h-[65vh] flex-col justify-center">
          <h1 className="bg-linear-to-r from-[#9442FE] to-[#3378FF] bg-clip-text text-transparent">
            {t.pages.home.title}
          </h1>
          <div className="flex flex-col">
            <strong dangerouslySetInnerHTML={{ __html: t.pages.home.meta }} />
            <Typewriter strings={t.pages.home.description} />
          </div>
          <ClientOpenCommandPalette />
        </section>
        <div className="space-y-8 border-white/10 border-t py-10">
          <p>{t.pages.home.introduction}</p>
          {t.pages.home.sections.map(section => (
            <section key={section.title}>
              <h2 className="mb-2 text-primary text-xl">{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
