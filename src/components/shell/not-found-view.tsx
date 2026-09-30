'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

type Destination = { label: string; href: string };

type NotFoundViewProps = {
  title: string;
  description: string;
  whereTo: string;
  noMatch: string;
  destinations: Destination[];
};

/**
 * The 404 as a question: type where you meant to go and the recovery links
 * narrow down. Every link is in the served HTML before anything is typed.
 */
export function NotFoundView({
  title,
  description,
  whereTo,
  noMatch,
  destinations
}: NotFoundViewProps) {
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const results = destinations.filter(item =>
    `${item.label} ${item.href}`.toLowerCase().includes(query.toLowerCase())
  );

  // Typing anywhere lands in the field.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.length !== 1 || document.activeElement === input.current)
        return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable]')) return;
      input.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  let letter = 0;

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-xl flex-1 flex-col justify-center px-6 py-24 text-[15px] leading-[1.7]">
      <p
        aria-hidden
        className="font-mono text-[13px] tabular-nums text-secondary/50"
      >
        404
      </p>
      <h1
        aria-label={title}
        className="mt-3 text-[2.75rem] font-medium leading-[1.05] tracking-[-0.04em] text-primary"
      >
        {title.split(' ').map((word, w) => (
          <span
            key={`${word}-${w}`}
            aria-hidden
            className="mr-[0.25em] inline-block whitespace-nowrap"
          >
            {word.split('').map(char => (
              <span
                key={letter}
                className="inline-block animate-blur-in"
                style={{ '--i': letter++ } as React.CSSProperties}
              >
                {char}
              </span>
            ))}
          </span>
        ))}
      </h1>
      <p className="mt-4 text-secondary">{description}</p>

      <label className="mt-10 flex h-12 items-center gap-3 rounded-xl bg-black px-4 ring-1 ring-white/10 transition-shadow focus-within:ring-white/30">
        <span aria-hidden className="text-secondary/50">
          ›
        </span>
        <input
          ref={input}
          value={query}
          placeholder={whereTo}
          aria-label={whereTo}
          spellCheck={false}
          autoComplete="off"
          onChange={event => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={event => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setActive(i => Math.min(i + 1, results.length - 1));
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActive(i => Math.max(i - 1, 0));
            } else if (event.key === 'Enter' && results[active]) {
              window.location.assign(results[active].href);
            }
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-primary outline-none placeholder:text-secondary/50"
        />
      </label>

      <nav aria-label="Page recovery" className="mt-3">
        <ul className="-mx-1">
          {results.map((item, i) => (
            <li key={item.href}>
              <a
                href={item.href}
                onPointerEnter={() => setActive(i)}
                className={cn(
                  'flex items-baseline justify-between rounded-lg px-4 py-2 transition-colors',
                  i === active && query
                    ? 'bg-white/[0.06] text-primary'
                    : 'hover:bg-white/[0.035] hover:text-primary'
                )}
              >
                <span className="text-primary">{item.label}</span>
                <span className="text-[13px] text-secondary/50">
                  {item.href}
                </span>
              </a>
            </li>
          ))}
        </ul>
        {results.length === 0 && (
          <p className="px-4 py-2 text-secondary/70">{noMatch}</p>
        )}
      </nav>
    </main>
  );
}
