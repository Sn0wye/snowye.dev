'use client';

import { type PointerEvent, useRef, useState } from 'react';
import { Specimen } from '@/components/shell/specimen';
import { cn } from '@/lib/cn';
import { interpolate } from '@/utils/interpolate';

type YearsTileProps = {
  years: { year: number; titles: string[] }[];
  copy: { title: string; hint: string; year: string };
};

/** One bar per year; hover scrubs through them and names what shipped. */
export function YearsTile({ years, copy }: YearsTileProps) {
  const ordered = [...years].sort((a, b) => a.year - b.year);
  const total = ordered.reduce((sum, y) => sum + y.titles.length, 0);
  const tallest = Math.max(...ordered.map(y => y.titles.length));
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const current = active === null ? null : ordered[active];

  const onMove = (event: PointerEvent<HTMLElement>) => {
    const rect = track.current?.getBoundingClientRect();
    if (!rect) return;
    const fraction = (event.clientX - rect.left) / rect.width;
    setActive(
      Math.min(
        ordered.length - 1,
        Math.max(0, Math.floor(fraction * ordered.length))
      )
    );
  };

  return (
    <Specimen
      title={
        current
          ? interpolate(copy.year, {
              count: current.titles.length,
              year: current.year
            })
          : interpolate(copy.title, { total, first: ordered[0]?.year ?? '' })
      }
      note={current ? current.titles.join(', ') : copy.hint}
      className="cursor-crosshair"
      onPointerMove={onMove}
      onPointerLeave={() => setActive(null)}
    >
      <div className="w-full px-8">
        <div ref={track} className="flex h-28 items-end gap-2">
          {ordered.map((year, i) => (
            <span
              key={year.year}
              className={cn(
                'flex-1 rounded-t-md transition-colors duration-150',
                active === null
                  ? 'bg-white/20'
                  : active === i
                    ? 'bg-primary'
                    : 'bg-white/10'
              )}
              style={{ height: `${(year.titles.length / tallest) * 100}%` }}
            />
          ))}
        </div>
        <div className="mt-3 flex gap-2 text-[11px] tabular-nums">
          {ordered.map((year, i) => (
            <span
              key={year.year}
              className={cn(
                'flex-1 text-center transition-colors',
                active === i ? 'text-primary' : 'text-secondary/50'
              )}
            >
              {String(year.year).slice(2)}
            </span>
          ))}
        </div>
      </div>
    </Specimen>
  );
}
