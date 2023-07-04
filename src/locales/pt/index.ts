import { defineLocale } from '..';
import { common } from './common';
import { pages } from './pages';

const locale = {
  common,
  pages
};

export default defineLocale(locale);
