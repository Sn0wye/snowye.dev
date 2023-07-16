import Head from 'next/head';
// import Typewriter from 'typewriter-effect';
import { Layout } from '../components/Layout';
import { OpenCommandPalette } from '../components/OpenCommandPalette';
import { home } from '../locales/en/pages/home';
import { Container, Content, Title } from '../styles/home';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>{home.title}</title>
        <meta content={home.title} property="og:title" />
        <meta content={home.description} name="description" />
        <meta content={home.description} property="og:description" />
      </Head>
      <Container>
        <Content>
          <Title>{home.title}</Title>
          <div>
            <strong>{home.meta}</strong>
            {/* <Typewriter
                options={{
                  strings: home.description,
                  autoStart: true,
                  deleteSpeed: 80,
                  delay: 60
                }}
              /> */}
          </div>
          <OpenCommandPalette />
        </Content>
      </Container>
    </Layout>
  );
}