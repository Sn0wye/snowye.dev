import { createI18n } from 'next-international';

export const {
  useI18n,
  I18nProvider,
  getLocaleProps,
  useCurrentLocale,
  useScopedI18n
} = createI18n({
  en: () => import('./en'),
  pt: () => import('./pt')
});
