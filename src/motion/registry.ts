/**
 * Shipped projects for /craft, which takes over from /projects: case studies,
 * showcases and motion. Only motion exists so far. A moment is one piece of
 * a real product's motion: shown live where the app's curves are pure
 * functions of time (ported and verified against SwiftUI, or, for a web app,
 * its own CSS timings and Motion springs), and as a screen recording where
 * it depends on the app's own views. Adding a project means
 * adding entries here; the pages read nothing else.
 */

import type { ListasKind } from './listas/moments';

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
  | 'charts'
  | ListasKind;

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
  },
  {
    slug: 'listas',
    name: 'Listas',
    tagline: {
      en: 'Shared checklists in real time, opened by a secret link, no account needed. A Next.js PWA on a Rust API.',
      pt: 'Checklists compartilhados em tempo real, abertos por um link secreto, sem precisar de conta. Um PWA em Next.js sobre uma API em Rust.'
    },
    stack: 'Next.js · Rust · WebSockets · Motion',
    links: [
      {
        label: 'sharedlists-delta.vercel.app',
        url: 'https://sharedlists-delta.vercel.app'
      },
      { label: 'GitHub', url: 'https://github.com/Sn0wye/sharedlists' }
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
  },
  {
    slug: 'tick',
    project: 'listas',
    title: { en: 'Ticking off', pt: 'Marcar como feito' },
    summary: {
      en: 'The box pops and draws its check, the strike follows the text, and the row holds its place until both land before it sinks under the open ones.',
      pt: 'A caixa pulsa e desenha o check, o risco acompanha o texto, e a linha segura o lugar até os dois terminarem antes de descer para baixo dos abertos.'
    },
    live: 'tick'
  },
  {
    slug: 'presence',
    project: 'listas',
    title: { en: 'Live presence', pt: 'Presença ao vivo' },
    summary: {
      en: 'Who is here, who is typing and which item each person is on, all over the list’s own socket.',
      pt: 'Quem está aqui, quem está digitando e em qual item cada um está, tudo pelo socket da própria lista.'
    },
    live: 'presence'
  },
  {
    slug: 'swipe-to-delete',
    project: 'listas',
    title: { en: 'Swipe to delete', pt: 'Deslizar para apagar' },
    summary: {
      en: 'Short of the threshold the row springs back; past it, it leaves and collapses, and Undo brings it back to its place.',
      pt: 'Antes do limite a linha volta; depois dele, ela sai e se fecha, e Desfazer devolve ela ao lugar.'
    },
    live: 'swipe-to-delete'
  },
  {
    slug: 'reorder',
    project: 'listas',
    title: { en: 'Reorder', pt: 'Reordenar' },
    summary: {
      en: 'Held by its grip, the row stays under the finger; each neighbour slides out of the way once the row passes its middle, and on release it settles into its slot.',
      pt: 'Segurada pela alça, a linha fica sob o dedo; cada vizinha sai do caminho quando a linha passa do meio dela, e ao soltar ela assenta no lugar.'
    },
    live: 'reorder'
  },
  {
    slug: 'someone-else',
    project: 'listas',
    title: { en: 'Someone else, live', pt: 'Outra pessoa, ao vivo' },
    summary: {
      en: 'Ana moves an item to the top, then swipes one away and takes it back. Her drags stay on her phone; Gabriel sees her colour on the row she touches, then each change landing as it reaches him.',
      pt: 'A Ana leva um item para o topo, depois desliza outro para apagar e desfaz. Os arrastos ficam no celular dela; o Gabriel vê a cor dela na linha que ela toca, e cada mudança chegando para ele.'
    },
    live: 'someone-else'
  }
];

export const findMoment = (slug: string) => moments.find(m => m.slug === slug);
export const findProject = (slug: string) =>
  projects.find(p => p.slug === slug);
