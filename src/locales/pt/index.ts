import { defineLocale } from '..';
import { type BaseTranslation } from '../base';
import { common } from './common';
import { pages } from './pages';

const locale: BaseTranslation = {
  common,
  pages
};

export default defineLocale(locale);
