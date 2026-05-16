'use client';

import { useLocale } from 'next-intl';
import { getMessages, type Messages } from './messages';
import type { AppLocale } from './routing';

/**
 * Type-safe access to the full message bundle on the client.
 * Use this instead of static `@/locales/en/...` imports inside client components.
 */
export const useT = (): Messages => {
  const locale = useLocale() as AppLocale;
  return getMessages(locale);
};

export const useAppLocale = (): AppLocale => {
  return useLocale() as AppLocale;
};
