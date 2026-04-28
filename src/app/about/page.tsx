import type { Metadata } from 'next';
import Image from 'next/image';
import { Base } from '@/components/base';
import { Pronunciation } from '@/components/pronunciation';
import { env } from '@/env';
import { about } from '@/locales/en/pages/about';
import { stripHtml } from '@/utils/stripHtml';
import { Career } from './career';

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
            <strong>Hey, I&apos;m Gabriel Trzimajewski!</strong>
            <Pronunciation /> I&apos;m a self-taught guy who lives, loves and
            learns, listens to a lot of music, loves coding, traveling and
            playing piano. I&apos;ve always been into computers since I was a
            kid, and then I discovered the beauty of JavaScript at{' '}
            <strong>
              <a
                href="https://rocketseat.com.br"
                target="_blank"
                rel="noreferrer"
              >
                Rocketseat
              </a>
            </strong>{' '}
            back in early 2020.
          </p>
          <p>
            I&apos;m currently a <strong>Software Engineer</strong> at{' '}
            <a href="https://banco.bradesco">Bradesco</a>, working on the Open
            Platform team building an internal log processing and observability
            platform used at <strong>banking scale</strong> for incident
            investigation and system monitoring. I&apos;m from Brazil and a big
            fan of <strong>twenty one pilots</strong>.
          </p>
        </section>
      </div>

      <div className="flex flex-col justify-between md:flex-row">
        <section className="mt-0 w-auto md:w-[48%]">
          <p>
            I&apos;m a <strong>backend-focused engineer</strong> with 4+ years
            shipping <strong>distributed systems</strong>, APIs, and cloud
            infra. I care about <strong>reliability</strong>,{' '}
            <strong>performance</strong>, and writing code that&apos;s actually
            nice to maintain at 3am when something is on fire. Before Bradesco,
            I spent a year+ at <strong>Mundo Invest</strong> leading a B3
            (Brazilian stock exchange) integration handling{' '}
            <strong>~100k requests/day</strong>, where I cut cloud costs by{' '}
            <strong>~50%</strong> and dropped a critical query from{' '}
            <strong>~8s to under 200ms</strong>.
          </p>
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

      <h2>{about.highlights}</h2>
      <ul>
        <li>
          Designed an audited, incident-based log access workflow at Bradesco,
          cutting investigation time by <strong>50%+</strong> while keeping
          full traceability and compliance.
        </li>
        <li>
          Led a B3 integration API at Mundo Invest serving{' '}
          <strong>~100k requests/day</strong> for{' '}
          <strong>~10K MAUs</strong> over REST, webhooks, and Kafka.
        </li>
        <li>
          Migrated AWS infra across regions with Terraform, lowering cloud
          costs by <strong>~50%</strong> through workload analysis and
          rightsizing.
        </li>
        <li>
          Optimized PostgreSQL search with <code>pg_trgm</code>, taking
          response times from <strong>~8s to &lt;200ms</strong> under
          production load.
        </li>
        <li>
          Replaced synchronous REST with <strong>gRPC</strong> on
          latency-sensitive paths, improving inter-service tail latency.
        </li>
        <li>
          Automated CI/CD with GitHub Actions (Docker, ECS, ECR), bringing
          deploys from <strong>15 minutes to 3</strong>.
        </li>
        <li>
          Built Datadog dashboards and SLO-based alerting, reducing incident
          investigation time by <strong>~80%</strong> and improving MTTR
          across a 5-engineer team.
        </li>
      </ul>

      <h2>{about.career}</h2>
      <Career />

      <h2>{about.education}</h2>
      <article style={{ marginBottom: 40 }}>
        <h3>B.Sc. Computer Science</h3>
        <p style={{ margin: 0 }}>
          <span className="cursor-default border-b border-solid border-primary text-primary no-underline transition-opacity duration-200 ease-in-out">
            UNINTER
          </span>
          <span> • Brazil</span>
        </p>
        <p style={{ margin: 0 }}>
          <span>Feb 2025 – Feb 2029</span>
          <span> • </span>
          <span>GPA 9.32/10</span>
        </p>
        <p>
          Focus on Algorithms, Data Structures, Databases, Distributed
          Systems, and Applied Mathematics (Calculus, Linear Algebra,
          Probability &amp; Statistics), with exposure to AI and Cloud
          Computing.
        </p>
      </article>

      <h2>{about.languages}</h2>
      <ul>
        <li>
          <strong>Portuguese</strong> — native
        </li>
        <li>
          <strong>English</strong> — fluent
        </li>
      </ul>
    </Base>
  );
}
