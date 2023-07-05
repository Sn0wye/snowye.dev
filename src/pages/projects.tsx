import Head from 'next/head';
import { Base } from '../components/Base';
import { AllProjects } from '../components/containers/Projects/AllProjects';
import { FeaturedProjects } from '../components/containers/Projects/FeaturedProjects';
import { projects as projectsData } from '../data/projects';
import { getTotalProjects } from '../utils/getTotalProjects';
import { stripHtml } from '../utils/stripHtml';
import { projects } from '../locales/en/pages/projects';

interface ProjectsProps {
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
}

export const getStaticProps = () => {
  const meta = {
    tagline: 'Apps. Libs. Open Source.',
    primaryColor: 'cyan',
    secondaryColor: 'green'
  };

  return { props: meta };
};

export default function Projects({
  primaryColor,
  secondaryColor,
  tagline
}: ProjectsProps) {
  const totalProjects = getTotalProjects(projectsData);

  const description = (
    <p>
      Side projects are a way to convert your{' '}
      <strong>thoughts and personality</strong> into code. Here you can see the{' '}
      <strong>{totalProjects} different.</strong> apps, projects and libraries
      that I've been working on.
    </p>
  );

  return (
    <Base
      tagline={tagline}
      title={projects.title}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
    >
      <Head>
        <title>{projects.title}</title>
        <meta content={projects.title} property='og:title' />
        <meta content={stripHtml('')} name='description' />
        <meta
          content={stripHtml(String(description))}
          property='og:description'
        />
        <meta content='https://snowye.dev/projects' property='og:url' />
      </Head>

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
