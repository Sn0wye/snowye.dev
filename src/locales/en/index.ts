import { pages } from './pages';
import { common } from './common';
import { defineLocale } from '..';

const translation = {
  common,
  pages
} as const;

export type BaseTranslation = typeof translation;

export default defineLocale(translation);
