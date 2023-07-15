import Head from 'next/head';
import { Base } from '../../components/Base';
import { Intro } from '../../components/containers/About/Intro';
import { about } from '../../locales/en/pages/about';
import { stripHtml } from '../../utils/stripHtml';

interface AboutProps {
  imagePath: string;
  primaryColor: string;
  secondaryColor: string;
}

export default function About({
  imagePath,
  primaryColor,
  secondaryColor
}: AboutProps) {
  return (
    <Base
      tagline={about.tagline}
      title={about.title}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
    >
      <Head>
        <title>{about.title}</title>
        <meta content={about.title} property="og:title" />
        <meta content={stripHtml(about.description)} name="description" />
        <meta
          content={stripHtml(about.description)}
          property="og:description"
        />
        <meta content="https://snowye.dev/about" property="og:url" />
        <meta content={`https://snowye.dev${imagePath}`} property="og:image" />
      </Head>

      <Intro />

      <h2>{about.bio}</h2>
      <blockquote>
        <p>{about.description}</p>
      </blockquote>

      {/* <h2>{t('career')}</h2> */}
      {/* <Career /> */}
    </Base>
  );
}

export const getStaticProps = () => {
  const meta = {
    imagePath: '/static/imagePaths/snowye-bw.jpg',
    primaryColor: 'pink',
    secondaryColor: 'purple'
  };

  return { props: meta };
};
