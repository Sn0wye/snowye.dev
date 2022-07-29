import { GetStaticProps } from 'next';
import Head from 'next/head';
import { OpenCommandPalette } from '../components/OpenCommandPalette';
import { Container, Content, Title } from './home.style';

interface HomeProps {
  title: string;
  description: string;
}

export default function Home({ title, description }: HomeProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta content={title} property='og:title' />
        <meta content={description} name='description' />
        <meta content={description} property='og:description' />
      </Head>
      <Container>
        <Content>
          <div>
            <Title>{title}</Title>
            <p>
              <strong>FrontEnd Developer on its own.</strong>
              <br />
              {description}
            </p>
            <OpenCommandPalette />
          </div>
        </Content>
      </Container>
    </>
  );
}

export const getStaticProps: GetStaticProps = () => {
  return {
    props: {
      title: 'Gabriel Trzimajewski',
      description:
        'A guy who loves helping people and turning the world into a better place.',
    },
  };
};
