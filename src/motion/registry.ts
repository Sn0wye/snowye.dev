/**
 * Shipped projects for /craft, which takes over from /projects: case studies,
 * showcases and motion. Only motion exists so far. A moment is one piece of
 * a real product's motion: shown live where the app's curves are pure
 * functions of time (ported, and verified against SwiftUI), and as a screen
 * recording where it depends on the app's own views. Adding a project means
 * adding entries here; the pages read nothing else.
 */

type Copy = { en: string; pt: string };

export type Project = {
  slug: string;
  name: string;
  tagline: Copy;
  stack: string;
  links: { label: string; url: string }[];
};

export type LiveKind =
  | 'settled-coin'
  | 'splash'
  | 'loader'
  | 'amount'
  | 'charts';

export type Recording = {
  /** Basename under /static/motion/<project>/. */
  name: string;
  width: number;
  height: number;
  fps: number;
  /** Where the clip came from, said plainly. */
  origin: Copy;
};

export type Moment = {
  slug: string;
  project: string;
  title: Copy;
  summary: Copy;
  /** Rendered in the browser from the app's own curves. */
  live?: LiveKind;
  /** Recorded from the app itself. */
  recording?: Recording;
};

export const projects: Project[] = [
  {
    slug: 'splitty',
    name: 'Splitty',
    tagline: {
      en: 'Shared expenses, split and settled. A SwiftUI app and its landing page.',
      pt: 'Despesas compartilhadas, divididas e acertadas. Um app em SwiftUI e sua landing page.'
    },
    stack: 'SwiftUI · Astro · Motion',
    links: [
      {
        label: 'splitty-landing.vercel.app',
        url: 'https://splitty-landing.vercel.app'
      },
      { label: 'GitHub', url: 'https://github.com/Sn0wye/splitty' }
    ]
  }
];

const simulator: Copy = {
  en: 'Recorded from the iOS Simulator at 60 fps, its refresh ceiling.',
  pt: 'Gravado no Simulador do iOS a 60 fps, o teto de atualização dele.'
};

export const moments: Moment[] = [
  {
    slug: 'settled-coin',
    project: 'splitty',
    title: { en: 'Settled coin', pt: 'Moeda acertada' },
    summary: {
      en: 'Everyone is square: the two halves of the mark come back together into one coin.',
      pt: 'Todo mundo quite: as duas metades da marca voltam a ser uma moeda só.'
    },
    live: 'settled-coin',
    recording: {
      name: 'settled',
      width: 640,
      height: 1392,
      fps: 60,
      origin: simulator
    }
  },
  {
    slug: 'amount-display',
    project: 'splitty',
    title: { en: 'Amount display', pt: 'Valor digitado' },
    summary: {
      en: 'Each digit is its own view, so only the one that changed moves.',
      pt: 'Cada dígito é uma view própria, então só o que mudou se move.'
    },
    live: 'amount',
    recording: {
      name: 'amount',
      width: 640,
      height: 1392,
      fps: 60,
      origin: simulator
    }
  },
  {
    slug: 'splash',
    project: 'splitty',
    title: { en: 'Splash', pt: 'Splash' },
    summary: {
      en: 'Picks up from the launch screen: one coin, cut and slid apart into the mark.',
      pt: 'Continua de onde a launch screen parou: uma moeda, cortada e separada na marca.'
    },
    live: 'splash'
  },
  {
    slug: 'loader',
    project: 'splitty',
    title: { en: 'Loader', pt: 'Loader' },
    summary: {
      en: 'The brand as a loading state: the halves meet and part again.',
      pt: 'A marca como estado de carregamento: as metades se encontram e se separam de novo.'
    },
    live: 'loader'
  },
  {
    slug: 'charts',
    project: 'splitty',
    title: { en: 'Charts', pt: 'Gráficos' },
    summary: {
      en: 'Ranges, lenses and headings: the donut eases between them, every figure rolls to its new value.',
      pt: 'Períodos, visões e categorias: o donut desliza entre eles e cada número rola até o valor novo.'
    },
    live: 'charts'
  }
];

export const findMoment = (slug: string) => moments.find(m => m.slug === slug);
export const findProject = (slug: string) =>
  projects.find(p => p.slug === slug);
