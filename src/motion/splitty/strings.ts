import type { AppLocale } from '@/i18n/routing';

import type { Category, Heading } from './charts';

/**
 * The app's own copy for the live screens, from Localizable.xcstrings (en and
 * pt-BR), so /pt shows the app as a Portuguese reader runs it. Money is not
 * here: Splitty formats an amount by its currency, not by the app language
 * (Currency.swift), so a USD group reads $1,234.50 in both.
 */
type Strings = {
  cancel: string;
  next: string;
  charts: string;
  done: string;
  lenses: readonly [string, string];
  ranges: readonly [string, string, string, string];
  byCategory: string;
  biggestExpenses: string;
  expenseCount: (n: number) => string;
  heading: Record<Heading, string>;
  category: Record<Category, string>;
  /** Sample expense names, as someone writing in that language would. */
  description: Record<string, string>;
  /** `.dateTime.day().month(.abbreviated).year()`. */
  dateLocale: string;
};

const en: Strings = {
  cancel: 'Cancel',
  next: 'Next',
  charts: 'Charts',
  done: 'Done',
  lenses: ['Group', 'Mine'],
  ranges: ['Month', '3 months', 'Year', 'All time'],
  byCategory: 'By category',
  biggestExpenses: 'Biggest expenses',
  expenseCount: n => `${n} expense${n === 1 ? '' : 's'}`,
  heading: {
    transportation: 'Transportation',
    food: 'Food and drink',
    utilities: 'Utilities',
    entertainment: 'Entertainment',
    uncategorized: 'Uncategorized'
  },
  category: {
    plane: 'Plane',
    hotel: 'Hotel',
    gas: 'Gas and fuel',
    taxi: 'Taxi',
    groceries: 'Groceries',
    dining: 'Dining out',
    electricity: 'Electricity',
    internet: 'TV, phone and internet',
    movies: 'Movies',
    general: 'General'
  },
  description: {},
  dateLocale: 'en-US'
};

const pt: Strings = {
  cancel: 'Cancelar',
  next: 'Próximo',
  charts: 'Gráficos',
  done: 'Concluído',
  lenses: ['Grupo', 'Minha parte'],
  ranges: ['Mês', '3 meses', 'Ano', 'Tudo'],
  byCategory: 'Por categoria',
  biggestExpenses: 'Maiores despesas',
  expenseCount: n => `${n} despesa${n === 1 ? '' : 's'}`,
  heading: {
    transportation: 'Transporte',
    food: 'Alimentação e bebidas',
    utilities: 'Contas',
    entertainment: 'Entretenimento',
    uncategorized: 'Sem categoria'
  },
  category: {
    plane: 'Avião',
    hotel: 'Hotel',
    gas: 'Combustível',
    taxi: 'Táxi',
    groceries: 'Supermercado',
    dining: 'Restaurantes',
    electricity: 'Eletricidade',
    internet: 'TV, telefone e internet',
    movies: 'Filmes',
    general: 'Geral'
  },
  description: {
    'Flights to Lisbon': 'Passagens para Lisboa',
    'Airbnb Lisbon': 'Airbnb Lisboa',
    'Airbnb Porto': 'Airbnb Porto',
    Groceries: 'Mercado',
    Electricity: 'Luz',
    Sushi: 'Sushi',
    'Pizza night': 'Noite da pizza',
    'Movie tickets': 'Ingressos do cinema',
    Gas: 'Gasolina',
    Misc: 'Diversos',
    Internet: 'Internet',
    'Uber home': 'Uber pra casa'
  },
  dateLocale: 'pt-BR'
};

export const APP_STRINGS: Record<AppLocale, Strings> = { en, pt };

/** A sample expense's name in the reader's language. */
export const describe = (s: Strings, description: string) =>
  s.description[description] ?? description;

/** `2026-09-12` as the app writes it: "Sep 12, 2026", "12 de set. de 2026". */
export const formatDate = (s: Strings, iso: string) =>
  new Intl.DateTimeFormat(s.dateLocale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${iso}T00:00:00Z`));
