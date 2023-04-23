import Image from 'next/image';
import { useScopedI18n } from '../../../locales';
import { Pronunciation } from '../../Pronunciation';
import { Container, Paragraph, Section } from './styles';

export const Intro = () => {
  const t = useScopedI18n('pages.about.intro');

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
            '@bp2': { marginTop: '-0.375rem' }
          }}
        >
          <strong>{t('1')}</strong>
          {t('2', {
            pronunciation: <Pronunciation />,
            link: (
              <strong>
                <a
                  href='https://rocketseat.com.br'
                  target='_blank'
                  rel='noreferrer'
                >
                  Rocketseat
                </a>
              </strong>
            )
          })}
        </Paragraph>
        <Paragraph dangerouslySetInnerHTML={{ __html: t('3') }} />
        <Paragraph dangerouslySetInnerHTML={{ __html: t('4') }} />
      </Section>
    </Container>
  );
};
