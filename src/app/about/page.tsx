import Head from 'next/head';
import { Base } from '@/components/Base';
import { Intro } from '@/components/containers/About/Intro';
import { stripHtml } from '@/utils/stripHtml';
import { about } from '@/locales/en/pages/about';

export default function About() {
  const meta = {
    imagePath: '/static/imagePaths/snowye-bw.jpg',
    primaryColor: 'pink',
    secondaryColor: 'purple'
  };

  return (
    <Base
      tagline={about.tagline}
      title={about.title}
      primaryColor={meta.primaryColor}
      secondaryColor={meta.secondaryColor}
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
        <meta
          content={`https://snowye.dev${meta.imagePath}`}
          property="og:image"
        />
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
