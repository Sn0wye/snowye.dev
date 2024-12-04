import { Base } from '@/components/base';
import { projects as projectsData } from '@/data/projects';
import { projects } from '@/locales/en/pages/projects';
import { getTotalProjects } from '@/utils/getTotalProjects';
import { stripHtml } from '@/utils/stripHtml';
import type { Metadata } from 'next';
import { AllProjects } from './all-projects';
import { FeaturedProjects } from './featured-projects';
import { Crafts } from './crafts';

const totalProjects = getTotalProjects(projectsData);
const description = (
  <p>
    Side projects are a way to convert your{' '}
    <strong>thoughts and personality</strong> into code. Here you can see the{' '}
    <strong>{totalProjects} different.</strong> apps, projects and libraries
    that I&apos;ve been working on.
  </p>
);

export const metadata = {
  title: projects.title,
  description: stripHtml(String(description)),
  openGraph: {
    description: stripHtml(String(description)),
    url: 'https://snowye.dev/projects'
  }
} satisfies Metadata;

export default function Projects() {
  const meta = {
    tagline: 'Apps. Libs. Open Source.',
    primaryColor: 'cyan',
    secondaryColor: 'green'
  } as const;

  return (
    <Base
      tagline={meta.tagline}
      title={projects.title}
      primaryColor={meta.primaryColor}
      secondaryColor={meta.secondaryColor}
    >
      {description}

      <h2>{projects.featured}</h2>
      <FeaturedProjects />

      <div className='grid grid-cols-2'>
        <div>
          <h2>{projects.all}</h2>
          <AllProjects />
        </div>
        <div>
          <h2>{projects.crafts}</h2>
          <Crafts />
        </div>
      </div>
    </Base>
  );
}
