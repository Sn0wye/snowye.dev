/**
 * Shipped projects for /craft, which takes over from /projects: case studies,
 * showcases and motion. Only motion exists so far. A moment is one piece of
 * a real product's motion: shown live where the app's curves are pure
 * functions of time (ported and verified against SwiftUI, or, for a web app,
 * its own CSS timings and Motion springs, or, for a terminal app, its Go
 * redraw loop and the cadence of what it reports), and as a screen recording where
 * it depends on the app's own views. Adding a project means
 * adding entries here; the pages read nothing else.
 */

import type { CloudCertifyKind } from './cloudcertify/moments';
import type { ListasKind } from './listas/moments';
import type { YtdKind } from './ytd/moments';

type Copy = { en: string; pt: string };

export type Project = {
  slug: string;
  name: string;
  tagline: Copy;
  stack: string;
  links: { label: string; url: string }[];
  /** A phone screen by default; a terminal needs a wide frame, a web app a browser window. */
  frame?: 'wide' | 'browser';
};

export type LiveKind =
  | 'settled-coin'
  | 'splash'
  | 'loader'
  | 'amount'
  | 'charts'
  | ListasKind
  | YtdKind
  | CloudCertifyKind;

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
    slug: 'cloudcertify',
    name: 'CloudCertify',
    tagline: {
      en: 'Free practice for AWS certifications: exam-style questions, drills drawn from what you missed, and a confidence rating that tells a lucky guess from a misconception. Next.js on an ASP.NET Core API.',
      pt: 'Prática gratuita para certificações AWS: questões no estilo da prova, drills montados a partir do que você errou e uma nota de confiança que separa um chute certo de um equívoco. Next.js sobre uma API em ASP.NET Core.'
    },
    stack: 'Next.js · ASP.NET Core · PostgreSQL · Motion',
    links: [
      {
        label: 'cloudcertify.snowye.dev',
        url: 'https://cloudcertify.snowye.dev'
      },
      {
        label: 'GitHub',
        url: 'https://github.com/CloudCertify/CloudCertify'
      }
    ],
    frame: 'browser'
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
        label: 'sharedlists.snowye.dev',
        url: 'https://sharedlists.snowye.dev'
      },
      { label: 'GitHub', url: 'https://github.com/Sn0wye/sharedlists' }
    ]
  },
  {
    slug: 'ytd',
    name: 'ytd',
    tagline: {
      en: 'YouTube downloads from the terminal: pick the video and audio quality, get one file back. Plain Go, no ffmpeg unless it has to re-encode.',
      pt: 'Downloads do YouTube pelo terminal: escolha a qualidade do vídeo e do áudio e receba um arquivo só. Go puro, sem ffmpeg a não ser que precise recodificar.'
    },
    stack: 'Go · Lip Gloss',
    links: [{ label: 'GitHub', url: 'https://github.com/Sn0wye/ytd' }],
    frame: 'wide'
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
    slug: 'check',
    project: 'cloudcertify',
    title: { en: 'Check', pt: 'Conferir' },
    summary: {
      en: 'A wrong pick, checked. It shakes, the right answer nods, and the explanation springs open and scrolls itself into view. Continue brings the next question in from the right.',
      pt: 'Uma escolha errada, conferida. Ela treme, a resposta certa acena, e a explicação abre numa mola e rola sozinha até ficar à vista. Continuar traz a próxima questão pela direita.'
    },
    live: 'check'
  },
  {
    slug: 'keyboard-drill',
    project: 'cloudcertify',
    title: { en: 'From the keyboard', pt: 'Pelo teclado' },
    summary: {
      en: 'Digits pick and move focus with them, Enter checks and then continues. A question that wants two answers takes two digits.',
      pt: 'Os números escolhem e levam o foco junto, Enter confere e depois continua. Uma questão que pede duas respostas leva dois números.'
    },
    live: 'keyboard-drill'
  },
  {
    slug: 'revisit',
    project: 'cloudcertify',
    title: { en: 'Marked to revisit', pt: 'Marcada para revisar' },
    summary: {
      en: 'In an exam nothing is graded until the end, so you rate how sure you are. A guess puts a mark on the navigator, and jumping back to it slides the question in from the left.',
      pt: 'Numa prova nada é corrigido até o fim, então você diz o quanto tem certeza. Um chute deixa uma marca no navegador, e voltar a ela traz a questão pela esquerda.'
    },
    live: 'revisit'
  },
  {
    slug: 'hero-chip',
    project: 'cloudcertify',
    title: { en: 'Rotating chip', pt: 'Selo rotativo' },
    summary: {
      en: 'The landing page names each provider in turn. The old word drops out letter by letter from the end, and the new one rises in only once it has gone.',
      pt: 'A landing page nomeia cada provedor por vez. A palavra antiga sai letra por letra a partir do fim, e a nova só sobe depois que ela sumiu.'
    },
    live: 'hero-chip'
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
  },
  {
    slug: 'ytd-down',
    project: 'ytd',
    title: { en: 'Down, start to finish', pt: 'Download, do início ao fim' },
    summary: {
      en: 'One step at a time down the rail: a spinner while it looks the video up, two pickers, a bar for the download, and the file at the bottom.',
      pt: 'Um passo de cada vez descendo o trilho: um spinner enquanto busca o vídeo, dois seletores, uma barra para o download e o arquivo no fim.'
    },
    live: 'ytd-down'
  },
  {
    slug: 'quality-picker',
    project: 'ytd',
    title: { en: 'Quality picker', pt: 'Seletor de qualidade' },
    summary: {
      en: 'Arrow keys in raw mode, redrawn on each press. Up from the top wraps to the last row, scrolling the list past its first twelve under a count of what is left; down from there wraps back.',
      pt: 'Setas em raw mode, redesenhado a cada tecla. Subir do topo dá a volta até a última linha e rola a lista além das doze primeiras, sob a contagem do que falta; descer dali volta ao topo.'
    },
    live: 'quality-picker'
  },
  {
    slug: 're-encode',
    project: 'ytd',
    title: { en: 'Re-encoding to mp3', pt: 'Recodificando para mp3' },
    summary: {
      en: 'ffmpeg reports its progress on a pipe every half second, so its bar steps in media time while the spinner keeps its own beat.',
      pt: 'O ffmpeg manda o progresso por um pipe a cada meio segundo, então a barra anda em tempo de mídia enquanto o spinner segue no próprio ritmo.'
    },
    live: 're-encode'
  },
  {
    slug: 'ctrl-c',
    project: 'ytd',
    title: { en: 'Ctrl-C', pt: 'Ctrl-C' },
    summary: {
      en: 'Cancelled mid-download, the bar stays where it stopped, the trail closes as cancelled and the cursor comes back.',
      pt: 'Cancelado no meio do download, a barra fica onde parou, o trilho fecha como cancelado e o cursor volta.'
    },
    live: 'ctrl-c'
  }
];

export const findMoment = (slug: string) => moments.find(m => m.slug === slug);
export const findProject = (slug: string) =>
  projects.find(p => p.slug === slug);
