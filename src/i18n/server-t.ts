import { getLocale } from 'next-intl/server';
import { getMessages, type Messages } from './messages';
import type { AppLocale } from './routing';

/**
 * Type-safe access to the full message bundle from a Server Component.
 */
export const getT = async (): Promise<Messages> => {
  const locale = (await getLocale()) as AppLocale;
  return getMessages(locale);
};

export const getAppLocale = async (): Promise<AppLocale> => {
  return (await getLocale()) as AppLocale;
};
