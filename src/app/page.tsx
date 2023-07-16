import { type Metadata } from 'next';
import { Layout } from '@/components/Layout';
import { OpenCommandPalette } from '@/components/OpenCommandPalette';
import { Container, Content, Title } from '@/styles/home';
import { home } from '@/locales/en/pages/home';
import { Typewriter } from './typewriter';

export const metadata = {
  title: home.title,
  description: home.description,
  openGraph: {
    description: home.description
  }
} satisfies Metadata;

export default function Home() {
  return (
    <Layout>
      <Container>
        <Content>
          <Title>{home.title}</Title>
          <div>
            <strong>{home.meta}</strong>
            <Typewriter strings={home.description} />
          </div>
          <OpenCommandPalette />
        </Content>
      </Container>
    </Layout>
  );
}
