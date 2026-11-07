import type { CSSProperties } from 'react';
import { SocialIcon } from '@/components/social-icons';
import { SOCIAL_LINKS } from './social-links';

type Destination = { label: string; href: string };

type NotFoundViewProps = {
  /** The big word in the chip, e.g. "Oops!". */
  badge: string;
  title: string;
  description: string;
  cta: Destination;
  /** Accessible name for the site links in the footer. */
  linksLabel: string;
  destinations: Destination[];
};

const ICONS: Record<(typeof SOCIAL_LINKS)[number]['label'], string> = {
  GitHub: 'Github',
  LinkedIn: 'Linkedin',
  Instagram: 'Instagram',
  Email: 'Mail'
};

type Star = {
  x: string;
  y: string;
  size: number;
  opacity: number;
  twinkle: boolean;
  delay: string;
};

/**
 * Seeded, so the server and the client draw the same sky: no hydration
 * mismatch and no layout shift.
 */
function makeStars(count: number, seed: number): Star[] {
  let state = seed;
  const random = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return Array.from({ length: count }, () => {
    const bright = random() > 0.9;
    return {
      x: `${(random() * 100).toFixed(2)}%`,
      y: `${(random() * 100).toFixed(2)}%`,
      size: bright ? 2 : random() > 0.6 ? 1.5 : 1,
      opacity: bright ? 0.9 : 0.25 + random() * 0.35,
      twinkle: bright || random() > 0.85,
      delay: `${(random() * 4).toFixed(2)}s`
    };
  });
}

const STARS = makeStars(140, 404);

/**
 * The 404: a quiet starfield, a short line of copy, one way home, and every
 * other destination in the footer. All links are in the served HTML.
 */
export function NotFoundView({
  badge,
  title,
  description,
  cta,
  linksLabel,
  destinations
}: NotFoundViewProps) {
  let letter = 0;

  return (
    <div className="relative isolate flex min-h-svh w-full flex-1 flex-col overflow-hidden text-[15px] leading-[1.7]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_40%,rgb(255_255_255/0.035),transparent_65%)]"
      >
        {STARS.map(star => (
          <span
            key={`${star.x}-${star.y}`}
            className={
              star.twinkle
                ? 'absolute rounded-full bg-white animate-twinkle'
                : 'absolute rounded-full bg-white'
            }
            style={
              {
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
                animationDelay: star.delay,
                '--star-opacity': star.opacity
              } as CSSProperties
            }
          />
        ))}
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <p
          aria-hidden
          className="rounded-2xl bg-white/[0.06] px-5 py-1 font-mono text-[3.25rem] leading-tight tracking-tight text-primary ring-1 ring-white/[0.06] sm:text-[4rem]"
        >
          {badge.split('').map(char => (
            <span
              key={letter}
              className="inline-block animate-blur-in"
              style={{ '--i': letter++ } as CSSProperties}
            >
              {char}
            </span>
          ))}
        </p>

        <h1 className="mt-8 text-balance text-[1.375rem] font-medium leading-snug tracking-[-0.02em] text-primary sm:text-[1.625rem]">
          {title}
        </h1>
        <p className="mt-3 max-w-[26rem] text-pretty text-[1rem] text-secondary sm:text-[1.0625rem]">
          {description}
        </p>

        <a
          href={cta.href}
          className="group mt-10 inline-flex animate-drift items-center rounded-lg bg-white/[0.07] px-4 py-2.5 font-medium text-[14px] text-primary ring-1 ring-white/[0.08] transition-colors hover:bg-white/[0.12]"
        >
          {cta.label}
        </a>
      </main>

      <footer className="border-white/[0.06] border-t px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-[13px]">
        <div className="mx-auto flex w-full max-w-[68rem] flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <nav aria-label={linksLabel}>
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1">
              {destinations.map(item => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-block py-1 transition-colors hover:text-primary"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex items-center gap-1">
            {SOCIAL_LINKS.map(link => {
              const Icon = SocialIcon[ICONS[link.label]];
              const external = link.href.startsWith('http');
              return (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noreferrer' : undefined}
                    aria-label={link.label}
                    title={link.label}
                    className="grid size-10 place-items-center rounded-lg transition-colors hover:bg-white/[0.06] hover:text-primary"
                  >
                    <Icon aria-hidden className="size-[18px]" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </footer>
    </div>
  );
}
