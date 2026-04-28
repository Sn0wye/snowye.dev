import { translation as en } from '@/locales/en';
import { translation as pt } from '@/locales/pt';
import type { AppLocale } from './routing';

// Both locales share the EN shape — TS will enforce the PT bundle matches it.
export const messages = { en, pt } satisfies Record<AppLocale, typeof en>;

export type Messages = typeof en;

export const getMessages = (locale: AppLocale): Messages => messages[locale];
