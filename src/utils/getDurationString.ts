import { intervalToDuration, parseISO } from 'date-fns';
import { enUS, ptBR } from 'date-fns/locale';

export type DurationLocale = 'en' | 'pt';

const labels: Record<
  DurationLocale,
  { yr: string; yrs: string; mo: string; mos: string; lt1mo: string }
> = {
  en: { yr: 'yr', yrs: 'yrs', mo: 'mo', mos: 'mos', lt1mo: '< 1 mo' },
  pt: { yr: 'ano', yrs: 'anos', mo: 'mês', mos: 'meses', lt1mo: '< 1 mês' }
};

export const dateFnsLocaleFor = (locale: DurationLocale) =>
  locale === 'pt' ? ptBR : enUS;

export const getDurationString = (
  startDate: string,
  endDate?: string,
  locale: DurationLocale = 'en'
) => {
  const interval = {
    start: parseISO(startDate),
    end: endDate ? parseISO(endDate) : new Date()
  };

  const { years = 0, months = 0 } = intervalToDuration(interval);
  const l = labels[locale];

  // Less than a month elapsed.
  if (years < 1 && months < 1) {
    return l.lt1mo;
  }

  const parts: string[] = [];

  if (years >= 1) {
    parts.push(`${years} ${years === 1 ? l.yr : l.yrs}`);
  }

  if (months >= 1) {
    parts.push(`${months} ${months === 1 ? l.mo : l.mos}`);
  }

  return parts.join(' ');
};
