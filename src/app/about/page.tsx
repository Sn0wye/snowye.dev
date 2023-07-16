import { type Metadata } from 'next';
import { Base } from '@/components/Base';
import { Intro } from '@/components/containers/About/Intro';
import { stripHtml } from '@/utils/stripHtml';
import { about } from '@/locales/en/pages/about';

export const metadata = {
  title: about.title,
  description: stripHtml(about.description),
  openGraph: {
    description: stripHtml(about.description),
    url: 'https://snowye.dev/about',
    images: [
      {
        url: 'https://snowye.dev/static/imagePaths/snowye-bw.jpg',
        width: 336,
        height: 336
      }
    ]
  }
} satisfies Metadata;

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
