import Image from 'next/image';
import { Pronunciation } from '../Pronunciation';
import { Container, Paragraph, Section } from './styles';

export const Intro = () => {
  return (
    <Container>
      <Section>
        <Image
          alt='Gabriel Trzimajewski'
          src='/static/images/snowye-bw.jpg'
          width='336'
          height='336'
          placeholder='blur'
          blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAP0lEQVQImQE0AMv/AFBQUJKSkqmpqaOjowCurq7v7+/Jycm5ubkA////jIyMn5+fg4ODADAwMD09PWlpaQAAAApRGnEHblMWAAAAAElFTkSuQmCC'
          priority
        />
      </Section>
      <Section>
        <Paragraph
          css={{
            marginTop: '1rem',
            '@bp2': { marginTop: '-0.375rem' },
          }}
        >
          <strong>Hey, I&apos;m Gabriel Trzimajewski!</strong>
          <Pronunciation />I started simply browsing in the internet and
          randomly discovered Javascript at{' '}
          <strong>
            <a
              href='https://rocketseat.com.br'
              target='_blank'
              rel='noreferrer'
            >
              Rocketseat
            </a>
          </strong>{' '}
          back on start of 2022.
        </Paragraph>
        <Paragraph>
          I&apos;m currently working on myself and trying to improve my hard and
          soft skills aswell. I&apos;m from Brazil and a big fan of{' '}
          <strong>twenty one pilots</strong>.
        </Paragraph>
        <Paragraph>
          I believe the beauty of the world stand on the{' '}
          <strong>little things</strong>. When I&apos;m not working, I like
          going to the gym, hanging out with my friends on Discord, and of
          course, coding side projects and helping the{' '}
          <strong>open source</strong> community.
        </Paragraph>
      </Section>
    </Container>
  );
};
