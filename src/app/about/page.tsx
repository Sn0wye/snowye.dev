import { type Metadata } from 'next';
import { Base } from '@/components/base';
import { stripHtml } from '@/utils/stripHtml';
import { env } from '@/env.mjs';
import { about } from '@/locales/en/pages/about';
import { Intro } from './intro';

export const metadata = {
  metadataBase:
    env.NODE_ENV === 'production'
      ? new URL('https://snowye.dev')
      : new URL('http://localhost:3000'),
  title: about.title,
  description: stripHtml(about.description),
  openGraph: {
    description: stripHtml(about.description),
    url: '/about',
    images: [
      {
        url: '/static/imagePaths/snowye-bw.jpg',
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
  } as const;

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
