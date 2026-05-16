'use client';

import { format, parseISO } from 'date-fns';
import { jobs } from '@/data/career';
import { useAppLocale, useT } from '@/i18n/use-t';
import { dateFnsLocaleFor, getDurationString } from '@/utils/getDurationString';

export const Career = () => {
  const t = useT();
  const locale = useAppLocale();
  const dfLocale = dateFnsLocaleFor(locale);

  return (
    <>
      {jobs.map(
        ({
          company,
          companyUrl,
          jobTitle,
          location,
          startDate,
          endDate,
          key
        }) => (
          <article style={{ marginBottom: 40 }} key={key}>
            <h3>{jobTitle}</h3>
            <p style={{ margin: 0 }}>
              {companyUrl ? (
                <a href={companyUrl} target="_blank" rel="noreferrer">
                  {company}
                </a>
              ) : (
                <span className="cursor-default border-b border-solid border-primary text-primary no-underline transition-opacity duration-200 ease-in-out">
                  {company}
                </span>
              )}
              {location && <span> • {location}</span>}
            </p>
            <p style={{ margin: 0 }}>
              <span>
                {format(parseISO(startDate), 'LLL yyyy', { locale: dfLocale })}
              </span>
              <span> – </span>
              <span>
                {endDate
                  ? format(parseISO(endDate), 'LLL yyyy', { locale: dfLocale })
                  : t.pages.about.present}
              </span>
              <span> • </span>
              <span>{getDurationString(startDate, endDate, locale)}</span>
            </p>
          </article>
        )
      )}
    </>
  );
};
