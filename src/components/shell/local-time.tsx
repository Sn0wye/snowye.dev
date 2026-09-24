'use client';

import { useEffect, useState } from 'react';
import { useAppLocale } from '@/i18n/use-t';
import { interpolate } from '@/utils/interpolate';

const HOME_ZONE = 'America/Sao_Paulo';

/** Minutes east of UTC for a zone at a given instant, e.g. -180 for Brazil. */
const zoneOffset = (timeZone: string, date: Date) => {
  const name =
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(date)
      .find(part => part.type === 'timeZoneName')?.value ?? 'GMT';
  const match = name.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  if (!match) return 0;
  const sign = match[1] === '-' ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0));
};

type LocalTimeProps = {
  city: string;
  copy: {
    localTime: string;
    timeDiff: { same: string; ahead: string; behind: string };
  };
  className?: string;
};

/** Live clock for Blumenau, and how far it is from the visitor. */
export function LocalTime({ city, copy, className }: LocalTimeProps) {
  const locale = useAppLocale();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  // Rendered client-side only: the server cannot know the visitor's zone.
  if (!now) return <p className={className}>&nbsp;</p>;

  const time = new Intl.DateTimeFormat(locale, {
    timeZone: HOME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now);
  const visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const hours =
    (zoneOffset(HOME_ZONE, now) - zoneOffset(visitorZone, now)) / 60;
  const diff =
    hours === 0
      ? copy.timeDiff.same
      : interpolate(hours > 0 ? copy.timeDiff.ahead : copy.timeDiff.behind, {
          hours: Math.abs(hours)
        });

  return (
    <p className={className}>
      <span className="text-primary tabular-nums">
        {interpolate(copy.localTime, { time, city })}
      </span>
      , {diff}
    </p>
  );
}
