import { createI18n } from 'next-international';

export const {
  useI18n,
  I18nProvider,
  getLocaleProps,
  useCurrentLocale,
  useScopedI18n,
  useChangeLocale
} = createI18n({
  en: () => import('./en'),
  pt: () => import('./pt')
});

import { type BaseTranslation } from './base';

type LocaleKeys<T> = keyof {
  [P in keyof T as T[P] extends string
    ? P
    : `${string & P}.${string & LocaleKeys<T[P]>}`]: true;
};
type LocaleValue<T, P extends string> = P extends `${infer Key}.${infer Tail}`
  ? Key extends keyof T
    ? LocaleValue<T[Key], Tail>
    : never
  : P extends keyof T
  ? T[P]
  : never;
type DefinedLocale = {
  [L in LocaleKeys<BaseTranslation>]: LocaleValue<BaseTranslation, L>;
};
type LocaleDefinition<T> = T extends string
  ? string
  : { [P in keyof T]: LocaleDefinition<T[P]> };
type RecursiveLocale = Record<string, string | object>;

export function defineLocale(
  locale: LocaleDefinition<BaseTranslation>
): DefinedLocale {
  const flatten = (l: RecursiveLocale, prefix = ''): RecursiveLocale =>
    Object.entries(l).reduce(
      (prev, [name, value]) => ({
        ...prev,
        ...(typeof value === 'string'
          ? { [prefix + name]: value }
          : flatten(value as RecursiveLocale, `${prefix}${name}.`))
      }),
      {}
    );
  return flatten(locale) as DefinedLocale;
}
