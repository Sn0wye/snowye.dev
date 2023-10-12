'use client';

import Image from 'next/image';
import { Pronunciation } from '@/components/pronunciation';

export const Intro = () => {
  return (
    <div className="flex flex-col justify-between md:flex-row">
      <section className="mt-0 w-auto md:w-[48%]">
        <Image
          alt="Gabriel Trzimajewski"
          src="/static/images/snowye-bw.jpg"
          width={336}
          height={336}
          style={{
            width: 'auto',
            height: 'auto'
          }}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAP0lEQVQImQE0AMv/AFBQUJKSkqmpqaOjowCurq7v7+/Jycm5ubkA////jIyMn5+fg4ODADAwMD09PWlpaQAAAApRGnEHblMWAAAAAElFTkSuQmCC"
          priority
        />
      </section>
      <section className="mt-0 w-auto md:w-[48%]">
        <p className="mt-4 md:-mt-1.5">
          <strong>Hey, I&apos;m Gabriel Trzimajewski!</strong>
          <Pronunciation /> I started by simply browsing in the internet and
          randomly discovered Javascript at{' '}
          <strong>
            <a
              href="https://rocketseat.com.br"
              target="_blank"
              rel="noreferrer"
            >
              Rocketseat
            </a>
          </strong>{' '}
          back on start of 2020.
        </p>
        <p>
          I&apos;m currently working by and on myself and trying to improve my
          hard and soft skills aswell. I&apos;m from Brazil and a big fan of{' '}
          <strong>twenty one pilots</strong>.
        </p>
        <p>
          I believe the beauty of the world stand on the{' '}
          <strong>little things</strong>. When I&apos;m not working, I like
          going to the gym, hanging out with my friends on Discord, and of
          course, coding side projects and helping the{' '}
          <strong>open source</strong> community, such as{' '}
          <strong>
            <a href="https://create.t3.gg">Create T3 App</a>
          </strong>
          , in which I was part of the documentation translation team into
          Brazilian Portuguese.
        </p>
      </section>
    </div>
  );
};
