import type { Metadata } from 'next';
import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import { Base } from '@/components/base';
import { env } from '@/env';
import { type AppLocale, routing } from '@/i18n/routing';
import { getT } from '@/i18n/server-t';
import { stripHtml } from '@/utils/stripHtml';
import { Career } from './career';
import { NamePronunciation } from './name-pronunciation';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

type PageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getT();

  // localePrefix: 'as-needed' — only non-default locales are prefixed.
  const localePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    metadataBase:
      env.NODE_ENV === 'production'
        ? new URL('https://snowye.dev')
        : new URL('http://localhost:3000'),
    title: t.pages.about.title,
    description: stripHtml(t.pages.about.description),
    openGraph: {
      description: stripHtml(t.pages.about.description),
      url: `${localePath}/about`,
      images: [
        {
          url: '/static/imagePaths/me.jpeg',
          width: 336,
          height: 336
        }
      ]
    }
  };
}

export default async function About({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getT();
  const a = t.pages.about;

  const meta = {
    imagePath: '/static/imagePaths/me.jpeg',
    primaryColor: 'pink',
    secondaryColor: 'purple'
  } as const;

  return (
    <Base
      tagline={a.tagline}
      title={a.title}
      primaryColor={meta.primaryColor}
      secondaryColor={meta.secondaryColor}
    >
      <div className="flex flex-col justify-between md:flex-row">
        <section className="mt-0 w-auto md:w-[48%]">
          <Image
            alt="Gabriel Trzimajewski"
            src="/static/images/me.jpeg"
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
            {a.bio.p1Before}
            <strong>
              {a.bio.p1FirstName} <NamePronunciation />
            </strong>
            {/* p1After ships with markup (<strong>, <a>) — render via HTML. */}
            <span dangerouslySetInnerHTML={{ __html: a.bio.p1After }} />
          </p>
          <p dangerouslySetInnerHTML={{ __html: a.bio.p2 }} />
        </section>
      </div>

      <div className="flex flex-col justify-between md:flex-row">
        <section className="mt-0 w-auto md:w-[48%]">
          <p dangerouslySetInnerHTML={{ __html: a.bio.p3 }} />
        </section>
        <section className="mt-0 w-auto md:w-[48%]">
          <Image
            alt="Gabriel Trzimajewski"
            src="/static/images/me2.jpeg"
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
      </div>

      <h2>{a.highlights}</h2>
      <ul>
        {a.highlightsList.map(item => (
          <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>

      <h2>{a.career}</h2>
      <Career />

      <h2>{a.education}</h2>
      <article style={{ marginBottom: 40 }}>
        <h3>{a.educationItem.degree}</h3>
        <p style={{ margin: 0 }}>
          <span className="cursor-default border-b border-solid border-primary text-primary no-underline transition-opacity duration-200 ease-in-out">
            {a.educationItem.school}
          </span>
          <span> • {a.educationItem.location}</span>
        </p>
        <p style={{ margin: 0 }}>
          <span>{a.educationItem.dates}</span>
          <span> • </span>
          <span>{a.educationItem.gpa}</span>
        </p>
        <p>{a.educationItem.focus}</p>
      </article>

      <h2>{a.languages}</h2>
      <ul>
        {a.languagesList.map(item => (
          <li key={item.name}>
            <strong>{item.name}</strong> — {item.level}
          </li>
        ))}
      </ul>
    </Base>
  );
}
