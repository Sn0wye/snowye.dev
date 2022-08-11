import { intervalToDuration, parseISO } from 'date-fns';

export const getDurationString = (startDate: string, endDate?: string) => {
  const interval = {
    start: parseISO(startDate),
    end: endDate ? parseISO(endDate) : new Date(),
  };
  const durationObj = intervalToDuration(interval);

  const { years, months } = durationObj;

  let durationStr = '';

  if (years !== undefined && months === undefined) {
    throw new Error('Duration < 1 month');
  }

  if (years !== undefined && years >= 1) {
    durationStr += `${years} yr${years > 1 ? 's' : ''} `;
  }

  if (months !== undefined && months >= 1) {
    durationStr += `${months} mo${months > 1 ? 's' : ''}`;
  }

  return durationStr;
};
