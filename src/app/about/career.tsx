import { jobs } from '@/data/career';
import { getDurationString } from '@/utils/getDurationString';
import { format, parseISO } from 'date-fns';

export const Career = () => {
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
              <span>{format(parseISO(startDate), 'LLL yyyy')}</span>
              <span> – </span>
              <span>
                {endDate ? format(parseISO(endDate), 'LLL yyyy') : 'Present'}
              </span>
              <span> • </span>
              <span>{getDurationString(startDate, endDate)}</span>
            </p>
          </article>
        )
      )}
    </>
  );
};
