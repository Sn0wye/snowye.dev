'use client';

import { Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LocalTime } from '@/components/shell/local-time';
import { LocaleToggle } from '@/components/shell/locale-toggle';
import { OpenSignal } from '@/components/shell/open-signal';
import { ShortcutButton } from '@/components/shell/shortcut-button';
import { SocialLinks } from '@/components/shell/social-links';
import { TypedLine } from '@/components/shell/typed-line';
import { usePronunciation } from '@/components/shell/use-pronunciation';
import { cn } from '@/lib/cn';

type IdentityColumnProps = {
  name: string;
  tagline: string;
  role: string;
  city: string;
  openSignal: string | null;
  pronunciation: { label: string; spell: string; ipa: string };
  sections: { id: string; label: string }[];
  copy: {
    localTime: string;
    timeDiff: { same: string; ahead: string; behind: string };
  };
};

/**
 * The pinned left half of the Identity Page: who he is, where the page is,
 * and how to reach him. Stays put while the right column scrolls.
 */
export function IdentityColumn({
  name,
  tagline,
  role,
  city,
  openSignal,
  pronunciation,
  sections,
  copy
}: IdentityColumnProps) {
  const syllables = pronunciation.spell.split('-');
  const voice = usePronunciation(syllables.length);
  const { active, jumpTo } = useScrollSpy(sections.map(s => s.id));
  let letterIndex = 0;

  return (
    <aside className="pt-24 lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-between lg:py-24">
      <div>
        <h1
          aria-label={name}
          className="text-[3.25rem] font-semibold leading-[1.02] tracking-[-0.04em] text-primary"
        >
          {name.split(' ').map(word => (
            <span
              key={word}
              aria-hidden
              className="mr-[0.25em] inline-block whitespace-nowrap"
            >
              {word.split('').map(char => {
                const i = letterIndex++;
                return (
                  <span
                    key={i}
                    className="inline-block animate-blur-in"
                    style={{ '--i': i } as React.CSSProperties}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          ))}
        </h1>

        <TypedLine
          text={tagline}
          delay={450 + name.length * 30}
          className="mt-5 text-[1.125rem] text-primary/85"
        />

        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={voice.play}
            aria-label={pronunciation.label}
            title={pronunciation.label}
            className={cn(
              '-ml-1 flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/5 hover:text-primary',
              voice.playing && 'text-primary'
            )}
          >
            <Volume2 className="size-4" />
          </button>
          <p aria-live="polite">
            {voice.playing ? (
              <span className="text-primary">
                {syllables.map((syllable, i) => (
                  <span key={syllable}>
                    <span
                      className={cn(
                        'transition-colors duration-150',
                        i === voice.current ? 'text-primary' : 'text-primary/30'
                      )}
                    >
                      {syllable}
                    </span>
                    {i < syllables.length - 1 && (
                      <span className="text-primary/30">-</span>
                    )}
                  </span>
                ))}
                <span className="ml-2 text-secondary">
                  /{pronunciation.ipa}/
                </span>
              </span>
            ) : (
              role
            )}
          </p>
        </div>

        <nav aria-label="Sections" className="mt-16 hidden lg:block">
          <ul className="space-y-2">
            {sections.map(section => {
              const isActive = active === section.id;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={isActive ? 'location' : undefined}
                    onClick={event => {
                      event.preventDefault();
                      jumpTo(section.id);
                    }}
                    className="group flex items-center gap-4 py-1 text-[13px]"
                  >
                    <span
                      className={cn(
                        'h-px transition-all duration-300 ease-out',
                        isActive
                          ? 'w-16 bg-primary'
                          : 'w-8 bg-white/20 group-hover:w-12 group-hover:bg-white/50'
                      )}
                    />
                    <span
                      className={cn(
                        'transition-colors',
                        isActive ? 'text-primary' : 'group-hover:text-primary'
                      )}
                    >
                      {section.label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="mt-12 space-y-4 text-[14px]">
        {openSignal && (
          <OpenSignal label={openSignal} className="text-primary/80" />
        )}
        <SocialLinks />
        <div className="flex items-center gap-5 text-[13px]">
          <LocaleToggle />
          <ShortcutButton />
        </div>
        <LocalTime city={city} copy={copy} className="text-[13px]" />
      </div>
    </aside>
  );
}

/**
 * Active section = the last one whose top has crossed a line just below where
 * a nav click parks it, pinned to the first section at the top of the page
 * and the last at the bottom. While a click is smooth-scrolling, the clicked
 * section stays active until the scroll arrives rather than flickering
 * through everything it passes.
 */
function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  const lock = useRef<{ target: number; timer: ReturnType<typeof setTimeout> }>(
    null
  );
  const key = ids.join(',');

  const compute = useCallback(() => {
    const list = key.split(',');
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY < 8) return setActive(list[0]);
    if (window.scrollY >= maxScroll - 2)
      return setActive(list[list.length - 1]);
    let current = list[0];
    for (const id of list) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= PARK_OFFSET + 32)
        current = id;
    }
    setActive(current);
  }, [key]);

  const unlock = useCallback(() => {
    if (!lock.current) return;
    clearTimeout(lock.current.timer);
    lock.current = null;
    compute();
  }, [compute]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!lock.current) return compute();
        if (Math.abs(window.scrollY - lock.current.target) < 2) unlock();
      });
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      if (lock.current) clearTimeout(lock.current.timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [compute, unlock]);

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const isFirst = id === key.split(',')[0];
    const target = Math.round(
      Math.min(
        maxScroll,
        isFirst
          ? 0
          : el.getBoundingClientRect().top + window.scrollY - PARK_OFFSET
      )
    );
    setActive(id);
    history.replaceState(history.state, '', `#${id}`);
    if (lock.current) clearTimeout(lock.current.timer);
    // Fallback in case the scroll is interrupted and never arrives.
    lock.current = { target, timer: setTimeout(unlock, 1600) };
    if (Math.abs(window.scrollY - target) < 2) return unlock();
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' });
  };

  return { active, jumpTo };
}

/** Where a nav click parks a section, in px from the top of the viewport. */
const PARK_OFFSET = 96;
