import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'pt'],
  defaultLocale: 'en',
  // Default locale (en) has no prefix, others get a prefix (e.g. /pt/about).
  localePrefix: 'as-needed'
});

export type AppLocale = (typeof routing.locales)[number];
