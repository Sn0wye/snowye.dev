import Head from 'next/head';
import Typewriter from 'typewriter-effect';
import { Layout } from '../components/Layout';
import { OpenCommandPalette } from '../components/OpenCommandPalette';
import { getLocaleProps, useI18n } from '../locales';
import { Container, Content, Title } from '../styles/home';

export default function Home() {
  const { scopedT } = useI18n();
  const t = scopedT('pages.home');

  return (
    <Layout>
      <Head>
        <title>{t('title')}</title>
        <meta content={t('title')} property='og:title' />
        <meta content={t('description')} name='description' />
        <meta content={t('description')} property='og:description' />
      </Head>
      <Container>
        <Content>
          <div>
            <Title>{t('title')}</Title>
            <div>
              <strong>{t('meta')}</strong>
              <Typewriter
                options={{
                  strings: t('description'),
                  autoStart: true,
                  deleteSpeed: 80,
                  delay: 60
                }}
              />
            </div>
            <OpenCommandPalette />
          </div>
        </Content>
      </Container>
    </Layout>
  );
}

export const getStaticProps = getLocaleProps();
