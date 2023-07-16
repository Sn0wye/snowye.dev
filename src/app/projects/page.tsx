import { type Metadata } from 'next';
import { Base } from '@/components/Base';
import { AllProjects } from '@/components/containers/Projects/AllProjects';
import { FeaturedProjects } from '@/components/containers/Projects/FeaturedProjects';
import { getTotalProjects } from '@/utils/getTotalProjects';
import { stripHtml } from '@/utils/stripHtml';
import { projects as projectsData } from '@/data/projects';
import { projects } from '@/locales/en/pages/projects';

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
  };

  return (
    <Base
      tagline={meta.tagline}
      title={projects.title}
      primaryColor={meta.primaryColor}
      secondaryColor={meta.secondaryColor}
    >
      {description}

      <h2>{projects.featured}</h2>
      <FeaturedProjects
        featured={[
          'Personal Portfolio',
          'Portfólio Pessoal',
          'Spaces',
          'iFinance',
          'duque.dev',
          'Snowye UI (WIP)'
        ]}
      />

      <h2>{projects.all}</h2>
      <AllProjects />
    </Base>
  );
}
