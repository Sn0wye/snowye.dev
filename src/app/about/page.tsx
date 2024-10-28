import { Base } from '@/components/base';
import { env } from '@/env';
import { about } from '@/locales/en/pages/about';
import { stripHtml } from '@/utils/stripHtml';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Career } from './career';
import { Pronunciation } from '@/components/pronunciation';

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
        url: '/static/imagePaths/me.jpeg',
        width: 336,
        height: 336
      }
    ]
  }
} satisfies Metadata;

export default function About() {
  const meta = {
    imagePath: '/static/imagePaths/me.jpeg',
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
      <div className='flex flex-col justify-between md:flex-row'>
        <section className='mt-0 w-auto md:w-[48%]'>
          <Image
            alt='Gabriel Trzimajewski'
            src='/static/images/me.jpeg'
            width={336}
            height={336}
            style={{
              width: 'auto',
              height: 'auto'
            }}
            placeholder='blur'
            blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAP0lEQVQImQE0AMv/AFBQUJKSkqmpqaOjowCurq7v7+/Jycm5ubkA////jIyMn5+fg4ODADAwMD09PWlpaQAAAApRGnEHblMWAAAAAElFTkSuQmCC'
            priority
          />
        </section>
        <section className='mt-0 w-auto md:w-[48%]'>
          <p className='mt-4 md:-mt-1.5'>
            <strong>Hey, I&apos;m Gabriel Trzimajewski!</strong>
            <Pronunciation /> I’m a self taught guy who lives, loves and learns,
            listens to a lot of music, loves coding, traveling and playing
            piano. I've always been interested in computers since I was a child,
            and then I discovered the beauty of JavaScript at{' '}
            <strong>
              <a
                href='https://rocketseat.com.br'
                target='_blank'
                rel='noreferrer'
              >
                Rocketseat
              </a>
            </strong>{' '}
            back on start of 2020.
          </p>
          <p>
            I&apos;m currently working at{' '}
            <a href='https://mundoinvest.com.br'>Mundo Invest</a> as a{' '}
            <strong>Backend Tech Lead</strong> and trying to improve my hard and
            soft skills as well. I&apos;m from Brazil and a big fan of{' '}
            <strong>twenty one pilots</strong>.
          </p>
        </section>
      </div>

      <div className='flex flex-col justify-between md:flex-row'>
        <section className='mt-0 w-auto md:w-[48%]'>
          <p>
            Throughout my career, I have demonstrated{' '}
            <strong>strong problem-solving</strong> skills, a solid
            understanding of best practices in software architecture, and a deep
            commitment to delivering <strong>high-quality code</strong>. I have
            experience with a broad range of technologies and fields, including{' '}
            <strong>Front-End</strong>, <strong>Back-End</strong>, and{' '}
            <strong>Cloud Services</strong>.
          </p>
        </section>
        <section className='mt-0 w-auto md:w-[48%]'>
          <Image
            alt='Gabriel Trzimajewski'
            src='/static/images/me2.jpeg'
            width={336}
            height={336}
            style={{
              width: 'auto',
              height: 'auto'
            }}
            placeholder='blur'
            blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAP0lEQVQImQE0AMv/AFBQUJKSkqmpqaOjowCurq7v7+/Jycm5ubkA////jIyMn5+fg4ODADAwMD09PWlpaQAAAApRGnEHblMWAAAAAElFTkSuQmCC'
            priority
          />
        </section>
      </div>

      <h2>{about.career}</h2>
      <Career />
    </Base>
  );
}
