import Head from 'next/head';
import { Base } from '../../components/Base';
import { Career } from '../../components/containers/About/Career';
import { Intro } from '../../components/containers/About/Intro';
import { getLocaleProps, useScopedI18n } from '../../locales';
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
  const t = useScopedI18n('pages.about');
  return (
    <Base
      tagline={t('tagline')}
      title={t('title')}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
    >
      <Head>
        <title>{t('title')}</title>
        <meta content={t('title')} property='og:title' />
        <meta content={stripHtml(t('description'))} name='description' />
        <meta content={stripHtml(t('description'))} property='og:description' />
        <meta content='https://snowye.dev/about' property='og:url' />
        <meta content={`https://snowye.dev${imagePath}`} property='og:image' />
      </Head>

      <Intro />

      <h2>{t('bio')}</h2>
      <blockquote>
        <p>{t('description')}</p>
      </blockquote>

      <h2>{t('career')}</h2>
      <Career />
    </Base>
  );
}

export const getStaticProps = getLocaleProps(() => {
  const meta = {
    imagePath: '/static/imagePaths/snowye-bw.jpg',
    primaryColor: 'pink',
    secondaryColor: 'purple'
  };

  return { props: meta };
});
