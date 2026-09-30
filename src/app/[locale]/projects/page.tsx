import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/shell/page-shell';
import { richText, Section } from '@/components/shell/section';
import { WebPageJsonLd } from '@/components/web-page-json-ld';
import { crafts, projects as projectsData } from '@/data/projects';
import { type AppLocale, routing } from '@/i18n/routing';
import { getT } from '@/i18n/server-t';
import { cn } from '@/lib/cn';
import { getTotalProjects } from '@/utils/getTotalProjects';
import { interpolate } from '@/utils/interpolate';
import { stripHtml } from '@/utils/stripHtml';
import { ProjectTile } from './project-tile';
import { YearsTile } from './years-tile';

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
  const copy = t.pages.projects;
  const totalProjects = getTotalProjects(projectsData);
  const descriptionHtml = interpolate(copy.description, { totalProjects });

  const featured = projectsData.flatMap(group =>
    group.projects
      .filter(project => project.featured)
      .map(project => ({ ...project, year: group.year }))
  );
  const craftTiles = crafts.flatMap(group =>
    group.crafts.map(craft => ({ ...craft, year: group.year }))
  );

  return (
    <PageShell
      current="/projects"
      title={t.common.navbar.projects}
      tagline={copy.tagline}
    >
      <WebPageJsonLd
        locale={locale}
        path="/projects"
        type="CollectionPage"
        name={copy.title}
        description={stripHtml(descriptionHtml)}
      />
      <p
        className={cn('mt-6 max-w-2xl', richText)}
        // The copy ships with <strong> emphasis.
        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
      />

      <section className="mt-16">
        <h2 className="sr-only">{copy.featured}</h2>
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 text-[14px] sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(project => (
            <ProjectTile
              key={project.id}
              title={project.title}
              note={String(project.year)}
              url={project.url}
              description={project.description}
              iconName={project.iconName}
            />
          ))}
          {craftTiles.map(craft => (
            <ProjectTile
              key={craft.id}
              title={craft.title}
              note={`${copy.craft}, ${craft.year}`}
              url={craft.url}
              description={craft.description}
            />
          ))}
          <YearsTile
            years={projectsData.map(group => ({
              year: group.year,
              titles: group.projects.map(project => project.title)
            }))}
            copy={copy.timeline}
          />
        </div>
      </section>

      <div className="mt-24">
        <Section title={copy.all}>
          <ol className="-mx-4 -mt-2.5">
            {projectsData.map(group =>
              group.projects.map((project, i) => (
                <li key={project.id}>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="grid grid-cols-[3.5rem_1fr] gap-4 rounded-xl px-4 py-2.5 transition-colors hover:bg-white/[0.035] sm:grid-cols-[3.5rem_11rem_1fr]"
                  >
                    <span className="tabular-nums text-secondary/50">
                      {i === 0 ? group.year : ''}
                    </span>
                    <span className="text-primary">{project.title}</span>
                    <span className="col-start-2 sm:col-start-auto">
                      {project.description}
                    </span>
                  </a>
                </li>
              ))
            )}
          </ol>
        </Section>
      </div>
    </PageShell>
  );
}
