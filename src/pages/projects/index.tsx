import { GetStaticProps } from 'next';
import Head from 'next/head';
import { Base } from '../../components/Base';
import { AllProjects } from '../../components/Projects/AllProjects';
import { FeaturedProjects } from '../../components/Projects/FeaturedProjects';
import { projects } from '../../data/projects';
import { getTotalProjects } from '../../utils/getTotalProjects';
import { stripHtml } from '../../utils/stripHtml';

interface ProjectsProps {
  title: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
}

export const getStaticProps: GetStaticProps<ProjectsProps> = () => {
  const totalProjects = getTotalProjects(projects);

  const meta = {
    title: 'Projects | Gabriel Trzimajewski',
    tagline: 'Apps. Libs. Open Source.',
    primaryColor: 'cyan',
    secondaryColor: 'green',
    description: `Side projects are a way to convert your <strong>thoughts and personality</strong> into code. Here you can see the <strong>${totalProjects} different.</strong> apps, projects and libraries that I've been working on.`,
  };

  return { props: meta };
};

export default function Projects({
  primaryColor,
  secondaryColor,
  tagline,
  title,
  description,
}: ProjectsProps) {
  return (
    <Base
      tagline={tagline}
      title={title}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
    >
      <Head>
        <title>{title}</title>
        <meta content={title} property='og:title' />
        <meta content={stripHtml(description)} name='description' />
        <meta content={stripHtml(description)} property='og:description' />
        <meta content='https://snowye.dev/projects' property='og:url' />
      </Head>

      <p dangerouslySetInnerHTML={{ __html: description }} />

      <h2>Featured Projects</h2>
      <FeaturedProjects
        featured={['Personal Portfolio', 'iFinance', 'Spaces', 'duque.dev']}
      />

      <h2>All Projects</h2>
      <AllProjects />
    </Base>
  );
}
