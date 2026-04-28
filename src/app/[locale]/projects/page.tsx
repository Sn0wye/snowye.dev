import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Base } from '@/components/base';
import { projects as projectsData } from '@/data/projects';
import { type AppLocale, routing } from '@/i18n/routing';
import { getT } from '@/i18n/server-t';
import { getTotalProjects } from '@/utils/getTotalProjects';
import { interpolate } from '@/utils/interpolate';
import { stripHtml } from '@/utils/stripHtml';
import { AllProjects } from './all-projects';
import { Crafts } from './crafts';
import { FeaturedProjects } from './featured-projects';

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
  const totalProjects = getTotalProjects(projectsData);
  const description = stripHtml(
    interpolate(t.pages.projects.description, { totalProjects })
  );

  // localePrefix: 'as-needed' — only non-default locales are prefixed.
  const localePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: t.pages.projects.title,
    description,
    openGraph: {
      description,
      url: `${localePath}/projects`
    }
  };
}

export default async function Projects({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getT();
  const totalProjects = getTotalProjects(projectsData);

  const meta = {
    tagline: 'Apps. Libs. Open Source.',
    primaryColor: 'cyan',
    secondaryColor: 'green'
  } as const;

  const descriptionHtml = interpolate(t.pages.projects.description, {
    totalProjects
  });

  return (
    <Base
      tagline={meta.tagline}
      title={t.pages.projects.title}
      primaryColor={meta.primaryColor}
      secondaryColor={meta.secondaryColor}
    >
      <p dangerouslySetInnerHTML={{ __html: descriptionHtml }} />

      <h2>{t.pages.projects.featured}</h2>
      <FeaturedProjects />

      <div className="grid grid-cols-2">
        <div>
          <h2>{t.pages.projects.all}</h2>
          <AllProjects />
        </div>
        <div>
          <h2>{t.pages.projects.crafts}</h2>
          <Crafts />
        </div>
      </div>
    </Base>
  );
}
