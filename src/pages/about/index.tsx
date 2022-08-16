import { GetStaticProps } from 'next';
import Head from 'next/head';
import { Career } from '../../components/About/Career';
import { Intro } from '../../components/About/Intro';
import { Base } from '../../components/Base';
import { stripHtml } from '../../utils/stripHtml';

interface AboutProps {
  title: string;
  description: string;
  tagline: string;
  image: string;
  primaryColor: string;
  secondaryColor: string;
}

export default function About({
  title,
  description,
  tagline,
  image,
  primaryColor,
  secondaryColor,
}: AboutProps) {
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
        <meta content='https://snowye.dev/about' property='og:url' />
        <meta content={`https://snowye.dev${image}`} property='og:image' />
      </Head>

      <Intro />

      <h2>Bio</h2>
      <blockquote>
        <p>{description}</p>
      </blockquote>

      <h2>Career</h2>
      <Career />
    </Base>
  );
}

export const getStaticProps: GetStaticProps = () => {
  const meta = {
    title: 'About | Gabriel Trzimajewski',
    description: `My name is Gabriel Trzimajewski. aka Snowye ✌️. I'm a Frontend Engineer on its own. I'm a guy who loves helping people and turning the world into a better place.`,
    tagline: 'Code. Sleep. Repeat.',
    image: '/static/images/snowye-bw.jpg',
    primaryColor: 'pink',
    secondaryColor: 'purple',
  };

  return { props: meta };
};
