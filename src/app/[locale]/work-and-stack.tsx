'use client';

import { type PointerEvent, useRef, useState } from 'react';
import { useAppLocale } from '@/i18n/use-t';
import { cn } from '@/lib/cn';
import { interpolate } from '@/utils/interpolate';

type Role = {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
};

type WorkAndStackProps = {
  roles: Role[];
  skills: string[];
  pinnedSkills: number;
  usage: Record<string, string[]>;
  copy: {
    work: string;
    stack: string;
    timeline: string;
    hint: string;
    usedAt: string;
    unused: string;
  };
};

const monthIndex = (value: string) => {
  const [year, month] = value.split('-').map(Number);
  return year * 12 + month - 1;
};

/**
 * Work and Stack answer each other: scrub the timeline or hover a role to
 * light it up, hover a skill to light up every role that used it.
 */
export function WorkAndStack({
  roles,
  skills,
  pinnedSkills,
  usage,
  copy
}: WorkAndStackProps) {
  const locale = useAppLocale();
  const [skill, setSkill] = useState<string | null>(null);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const track = useRef<HTMLDivElement>(null);

  const spans = roles.map(role => ({
    ...role,
    from: monthIndex(role.startDate),
    to: monthIndex(role.endDate ?? role.startDate)
  }));
  const first = Math.min(...spans.map(s => s.from));
  const last = Math.max(...spans.map(s => s.to));
  const length = last - first + 1;
  const firstYear = Math.floor(first / 12);
  const years = Array.from(
    { length: Math.floor(last / 12) - firstYear + 1 },
    (_, i) => firstYear + i
  );

  const lit: Set<string> | null = skill
    ? new Set(usage[skill])
    : cursor !== null
      ? new Set(
          spans
            .filter(s => cursor >= s.from && cursor <= s.to)
            .map(s => s.company)
        )
      : hoveredRole
        ? new Set([hoveredRole])
        : null;

  const onScrub = (event: PointerEvent<HTMLDivElement>) => {
    const rect = track.current?.getBoundingClientRect();
    if (!rect) return;
    const fraction = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / rect.width)
    );
    setCursor(first + Math.round(fraction * (length - 1)));
  };

  const cursorLabel =
    cursor === null
      ? null
      : new Intl.DateTimeFormat(locale, {
          month: 'long',
          year: 'numeric'
        }).format(new Date(Math.floor(cursor / 12), cursor % 12, 1));

  const usedAt = skill
    ? usage[skill].length
      ? interpolate(copy.usedAt, { companies: usage[skill].join(', ') })
      : copy.unused
    : null;

  return (
    <>
      <section id="work" className="scroll-mt-24">
        <h2 className="mb-6 text-[13px] text-primary lg:sr-only">
          {copy.work}
        </h2>

        <div
          ref={track}
          onPointerMove={onScrub}
          onPointerLeave={() => setCursor(null)}
          className="relative cursor-crosshair touch-none select-none py-3"
        >
          <p className="mb-4 h-5 text-[13px]" aria-hidden>
            {cursorLabel ? (
              <span className="text-primary">{cursorLabel}</span>
            ) : (
              <span className="text-secondary/60">{copy.timeline}</span>
            )}
          </p>
          <div className="relative">
            <ul className="space-y-2" aria-hidden>
              {[...spans].reverse().map(span => (
                <li key={span.company} className="h-1">
                  <span
                    className={cn(
                      'block h-full rounded-full transition-colors duration-150',
                      lit?.has(span.company) ? 'bg-primary' : 'bg-white/15'
                    )}
                    style={{
                      marginLeft: `${((span.from - first) / length) * 100}%`,
                      width: `${((span.to - span.from + 1) / length) * 100}%`
                    }}
                  />
                </li>
              ))}
            </ul>
            {cursor !== null && (
              <span
                aria-hidden
                className="pointer-events-none absolute -top-2 -bottom-2 w-px bg-primary/50"
                style={{ left: `${((cursor - first + 0.5) / length) * 100}%` }}
              />
            )}
          </div>
          <div
            aria-hidden
            className="mt-3 flex justify-between text-[11px] tabular-nums text-secondary/50"
          >
            {years.map(year => (
              <span key={year}>{year}</span>
            ))}
          </div>
        </div>

        <ul className="-mx-4 mt-6">
          {spans.map(span => {
            const isLit = lit?.has(span.company);
            return (
              <li
                key={span.company}
                onPointerEnter={() => setHoveredRole(span.company)}
                onPointerLeave={() => setHoveredRole(null)}
                className={cn(
                  'grid grid-cols-[6.5rem_1fr] gap-4 rounded-xl px-4 py-3 transition-all duration-200',
                  isLit && 'bg-white/[0.03]',
                  lit && !isLit && 'opacity-35'
                )}
              >
                <span className="text-[13px] tabular-nums leading-[1.9] text-secondary/60">
                  {span.startDate.slice(0, 4)} – {span.endDate?.slice(0, 4)}
                </span>
                <span>
                  <span className="block text-primary">{span.company}</span>
                  <span className="block">{span.position}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="stack" className="scroll-mt-24">
        <h2 className="mb-6 text-[13px] text-primary lg:sr-only">
          {copy.stack}
        </h2>
        <ul className="flex flex-wrap gap-x-1 gap-y-1.5 text-[1.0625rem]">
          {skills.map((name, i) => (
            <li key={name}>
              <button
                type="button"
                onPointerEnter={() => setSkill(name)}
                onPointerLeave={() => setSkill(null)}
                onFocus={() => setSkill(name)}
                onBlur={() => setSkill(null)}
                className={cn(
                  'cursor-default rounded-md px-2 py-0.5 transition-colors duration-150',
                  skill
                    ? name === skill
                      ? 'bg-white/[0.06] text-primary'
                      : 'text-secondary/35'
                    : i < pinnedSkills
                      ? 'text-primary'
                      : 'text-secondary'
                )}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
        <p aria-live="polite" className="mt-5 px-2 text-[13px]">
          {usedAt ? (
            <span className="text-primary">{usedAt}</span>
          ) : (
            <span className="text-secondary/60">{copy.hint}</span>
          )}
        </p>
      </section>
    </>
  );
}
