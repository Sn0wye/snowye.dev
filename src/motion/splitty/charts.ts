import {
  type SwiftSpring,
  settleTime,
  springValue,
  swiftSpring
} from '@/lib/swift-spring';

/**
 * ChartsView, as a pure function of time. A scripted session (range, lens,
 * a legend tap, two donut taps, and back) is a list of beats, each one the
 * state the view model publishes and the animation SwiftUI runs it under.
 * Every animated value is a sum of step responses, one per beat that moved
 * it, which is how SwiftUI retargets a linear spring mid-flight.
 */

/** `.snappy`: Spring(duration: 0.5, bounce: 0.15). Selection, lens, data. */
const snappy = swiftSpring(0.5, 0.85);
/** HeadingDonut: `.spring(response: 0.4, dampingFraction: 1)` on new slices. */
const donut = swiftSpring(0.4, 1);
/** BiggestExpenses: `.snappy(duration: 0.25, extraBounce: 0)`. */
const ranks = swiftSpring(0.25, 0.85);
/**
 * The segmented pickers are UIKit's; their thumb animation isn't in the
 * app's code. A critically damped quarter second is close to what iOS does.
 */
const thumb = swiftSpring(0.3, 1);

export type Heading =
  | 'transportation'
  | 'food'
  | 'utilities'
  | 'entertainment'
  | 'uncategorized';

/** Category heading order, which breaks ties. */
const HEADINGS: Heading[] = [
  'uncategorized',
  'entertainment',
  'food',
  'transportation',
  'utilities'
];

/** Assets.xcassets, dark appearance. */
export const TINT: Record<Heading, string> = {
  transportation: '#7f1d1d',
  food: '#9a3412',
  utilities: '#085a51',
  entertainment: '#6d28d9',
  uncategorized: '#3f4a5b'
};

export type Category =
  | 'plane'
  | 'hotel'
  | 'gas'
  | 'taxi'
  | 'groceries'
  | 'dining'
  | 'electricity'
  | 'internet'
  | 'movies'
  | 'general';

export const CATEGORY: Record<Category, { heading: Heading }> = {
  plane: { heading: 'transportation' },
  hotel: { heading: 'transportation' },
  gas: { heading: 'transportation' },
  taxi: { heading: 'transportation' },
  groceries: { heading: 'food' },
  dining: { heading: 'food' },
  electricity: { heading: 'utilities' },
  internet: { heading: 'utilities' },
  movies: { heading: 'entertainment' },
  general: { heading: 'uncategorized' }
};

/** Category order, which breaks ties among leaves. */
const CATEGORIES = Object.keys(CATEGORY) as Category[];

type Top = { id: number; description: string; date: string; cents: number };
type Stats = {
  count: number;
  categories: { category: Category; cents: number; top: Top[] }[];
};

const top = (id: number, description: string, date: string, cents: number) => ({
  id,
  description,
  date,
  cents
});

/**
 * A trip, then a month with a weekend away, for the whole group and as one
 * member's share. Headings rank the same in every state: how Swift Charts
 * interpolates sectors that swap places isn't documented, so the session
 * never asks it to.
 */
const DATA: Record<'all' | 'month', Record<'group' | 'mine', Stats>> = {
  all: {
    group: {
      count: 52,
      categories: [
        {
          category: 'plane',
          cents: 248_000,
          top: [top(1, 'Flights to Lisbon', '2026-09-12', 248_000)]
        },
        {
          category: 'hotel',
          cents: 264_500,
          top: [
            top(2, 'Airbnb Lisbon', '2026-09-12', 186_500),
            top(14, 'Airbnb Porto', '2026-10-09', 78_000)
          ]
        },
        {
          category: 'groceries',
          cents: 182_000,
          top: [
            top(3, 'Groceries', '2026-10-03', 17_800),
            top(4, 'Groceries', '2026-10-17', 9_640)
          ]
        },
        {
          category: 'electricity',
          cents: 150_000,
          top: [
            top(5, 'Electricity', '2026-08-01', 31_000),
            top(6, 'Electricity', '2026-10-01', 25_000)
          ]
        },
        {
          category: 'dining',
          cents: 148_000,
          top: [
            top(7, 'Sushi', '2026-10-11', 25_400),
            top(8, 'Pizza night', '2026-10-18', 13_200)
          ]
        },
        {
          category: 'movies',
          cents: 70_000,
          top: [top(9, 'Movie tickets', '2026-10-24', 8_800)]
        },
        {
          category: 'gas',
          cents: 54_000,
          top: [top(10, 'Gas', '2026-10-14', 12_000)]
        },
        {
          category: 'general',
          cents: 50_000,
          top: [top(11, 'Misc', '2026-10-08', 4_200)]
        },
        {
          category: 'internet',
          cents: 35_970,
          top: [top(12, 'Internet', '2026-10-05', 11_990)]
        },
        {
          category: 'taxi',
          cents: 18_640,
          top: [top(13, 'Uber home', '2026-10-19', 3_820)]
        }
      ]
    },
    mine: {
      count: 47,
      categories: [
        {
          category: 'plane',
          cents: 82_667,
          top: [top(1, 'Flights to Lisbon', '2026-09-12', 82_667)]
        },
        {
          category: 'hotel',
          cents: 101_167,
          top: [
            top(2, 'Airbnb Lisbon', '2026-09-12', 62_167),
            top(14, 'Airbnb Porto', '2026-10-09', 39_000)
          ]
        },
        {
          category: 'groceries',
          cents: 60_667,
          top: [
            top(3, 'Groceries', '2026-10-03', 5_933),
            top(4, 'Groceries', '2026-10-17', 3_213)
          ]
        },
        {
          category: 'electricity',
          cents: 50_000,
          top: [
            top(5, 'Electricity', '2026-08-01', 10_333),
            top(6, 'Electricity', '2026-10-01', 8_333)
          ]
        },
        {
          category: 'dining',
          cents: 49_333,
          top: [
            top(7, 'Sushi', '2026-10-11', 8_467),
            top(8, 'Pizza night', '2026-10-18', 4_400)
          ]
        },
        {
          category: 'movies',
          cents: 23_333,
          top: [top(9, 'Movie tickets', '2026-10-24', 4_400)]
        },
        {
          category: 'gas',
          cents: 18_000,
          top: [top(10, 'Gas', '2026-10-14', 4_000)]
        },
        {
          category: 'general',
          cents: 16_667,
          top: [top(11, 'Misc', '2026-10-08', 1_400)]
        },
        {
          category: 'internet',
          cents: 11_990,
          top: [top(12, 'Internet', '2026-10-05', 3_997)]
        },
        {
          category: 'taxi',
          cents: 9_320,
          top: [top(13, 'Uber home', '2026-10-19', 1_910)]
        }
      ]
    }
  },
  month: {
    group: {
      count: 20,
      categories: [
        {
          category: 'hotel',
          cents: 78_000,
          top: [top(14, 'Airbnb Porto', '2026-10-09', 78_000)]
        },
        {
          category: 'groceries',
          cents: 61_280,
          top: [
            top(3, 'Groceries', '2026-10-03', 17_800),
            top(4, 'Groceries', '2026-10-17', 9_640)
          ]
        },
        {
          category: 'dining',
          cents: 38_950,
          top: [
            top(7, 'Sushi', '2026-10-11', 25_400),
            top(8, 'Pizza night', '2026-10-18', 13_200)
          ]
        },
        {
          category: 'electricity',
          cents: 25_000,
          top: [top(6, 'Electricity', '2026-10-01', 25_000)]
        },
        {
          category: 'gas',
          cents: 18_000,
          top: [top(10, 'Gas', '2026-10-14', 12_000)]
        },
        {
          category: 'internet',
          cents: 11_990,
          top: [top(12, 'Internet', '2026-10-05', 11_990)]
        },
        {
          category: 'movies',
          cents: 8_800,
          top: [top(9, 'Movie tickets', '2026-10-24', 8_800)]
        },
        {
          category: 'taxi',
          cents: 8_640,
          top: [top(13, 'Uber home', '2026-10-19', 3_820)]
        },
        {
          category: 'general',
          cents: 4_200,
          top: [top(11, 'Misc', '2026-10-08', 4_200)]
        }
      ]
    },
    mine: {
      count: 17,
      categories: [
        {
          category: 'hotel',
          cents: 39_000,
          top: [top(14, 'Airbnb Porto', '2026-10-09', 39_000)]
        },
        {
          category: 'groceries',
          cents: 20_427,
          top: [
            top(3, 'Groceries', '2026-10-03', 5_933),
            top(4, 'Groceries', '2026-10-17', 3_213)
          ]
        },
        {
          category: 'dining',
          cents: 16_010,
          top: [
            top(7, 'Sushi', '2026-10-11', 8_467),
            top(8, 'Pizza night', '2026-10-18', 4_400)
          ]
        },
        {
          category: 'electricity',
          cents: 8_333,
          top: [top(6, 'Electricity', '2026-10-01', 8_333)]
        },
        {
          category: 'gas',
          cents: 6_000,
          top: [top(10, 'Gas', '2026-10-14', 4_000)]
        },
        {
          category: 'movies',
          cents: 4_400,
          top: [top(9, 'Movie tickets', '2026-10-24', 4_400)]
        },
        {
          category: 'taxi',
          cents: 4_320,
          top: [top(13, 'Uber home', '2026-10-19', 1_910)]
        },
        {
          category: 'internet',
          cents: 3_997,
          top: [top(12, 'Internet', '2026-10-05', 3_997)]
        },
        {
          category: 'general',
          cents: 1_400,
          top: [top(11, 'Misc', '2026-10-08', 1_400)]
        }
      ]
    }
  }
};

/** Segments in each picker; their labels are the app's, per language. */
export const LENS_COUNT = 2;
export const RANGE_COUNT = 4;

type Snapshot = {
  lens: 0 | 1;
  range: 0 | 3;
  /** The range whose numbers are on screen; lags `range` while loading. */
  loaded: 0 | 3;
  updating: boolean;
  selected: Heading | null;
};

type Tap = { x: number; y: number };

type Beat = {
  at: number;
  state: Snapshot;
  /** The transaction's animation for layout and figures. */
  spring: SwiftSpring;
  /** Where a finger came down for this beat, in screen points. */
  tap?: Tap | ((s: Scene) => Tap);
};

/* -------------------------------------------------------------------------- */
/* Layout, in points on a 402 pt wide sheet                                    */
/* -------------------------------------------------------------------------- */

export const SCREEN_W = 402;
export const SCREEN_H = 720;
export const NAV_H = 62;
export const PICKER_Y = NAV_H + 12;
export const PICKER_H = 30;
export const PICKER_GAP = 10;
export const CARD_X = 20;
export const CARD_W = SCREEN_W - CARD_X * 2;
export const CARD_PAD = 16;
export const INNER_W = CARD_W - CARD_PAD * 2;
export const CARD_Y = PICKER_Y + PICKER_H * 2 + PICKER_GAP + 16;
const TITLE_H = 22;
export const DONUT_Y = CARD_PAD + TITLE_H + 14;
export const DONUT_H = 220;
export const LEGEND_Y = DONUT_Y + DONUT_H + 14;
export const HEADING_ROW_H = 20;
export const CATEGORY_ROW_H = 18;
const ROW_GAP = 10;
export const CHIP_H = 32;
export const EXPENSE_ROW_H = 38;
const EXPENSE_GAP = 12;
export const OUTER_R = DONUT_H / 2;
export const INNER_R = OUTER_R * 0.62;

/* -------------------------------------------------------------------------- */
/* What the view model derives                                                 */
/* -------------------------------------------------------------------------- */

const stats = (s: { lens: 0 | 1; loaded: 0 | 3 }) =>
  DATA[s.loaded === 0 ? 'month' : 'all'][s.lens === 0 ? 'group' : 'mine'];

const totalOf = (st: Stats) => st.categories.reduce((n, c) => n + c.cents, 0);

const ranked = <K extends string>(totals: Map<K, number>, order: K[]) =>
  [...totals]
    .filter(([, v]) => v !== 0)
    .sort(([ka, a], [kb, b]) =>
      a !== b ? b - a : order.indexOf(ka) - order.indexOf(kb)
    );

const slicesOf = (st: Stats) => {
  const by = new Map<Heading, number>();
  for (const c of st.categories) {
    const h = CATEGORY[c.category].heading;
    by.set(h, (by.get(h) ?? 0) + c.cents);
  }
  return ranked(by, HEADINGS);
};

export type RowId = `h:${Heading}` | `c:${Category}`;

const legendOf = (st: Stats, selected: Heading | null) => {
  const total = totalOf(st);
  const rows: { id: RowId; cents: number; fraction: number }[] = [];
  for (const [heading, cents] of slicesOf(st)) {
    rows.push({ id: `h:${heading}`, cents, fraction: cents / total });
    if (heading !== selected) continue;
    const by = new Map<Category, number>();
    for (const c of st.categories)
      if (CATEGORY[c.category].heading === heading)
        by.set(c.category, (by.get(c.category) ?? 0) + c.cents);
    for (const [category, v] of ranked(by, CATEGORIES))
      rows.push({ id: `c:${category}`, cents: v, fraction: v / total });
  }
  return rows;
};

const topOf = (st: Stats, selected: Heading | null) =>
  st.categories
    .filter(c => !selected || CATEGORY[c.category].heading === selected)
    .flatMap(c => c.top.map(t => ({ ...t, category: c.category })))
    .sort((a, b) => b.cents - a.cents || b.id - a.id)
    .slice(0, 5);

/* -------------------------------------------------------------------------- */
/* Text                                                                        */
/* -------------------------------------------------------------------------- */

export const money = (cents: number) =>
  `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const percent = (f: number) => `${Math.round(f * 100)}%`;

/* -------------------------------------------------------------------------- */
/* The session                                                                 */
/* -------------------------------------------------------------------------- */

const A: Snapshot = {
  lens: 0,
  range: 3,
  loaded: 3,
  updating: false,
  selected: null
};

const pickerTap = (row: 0 | 1, index: number, count: number): Tap => ({
  x: 20 + ((index + 0.5) * (SCREEN_W - 40)) / count,
  y: PICKER_Y + row * (PICKER_H + PICKER_GAP) + PICKER_H / 2
});

const beats: Beat[] = (() => {
  const list: Beat[] = [{ at: 0, state: A, spring: snappy }];
  let s = A;
  const go = (at: number, change: Partial<Snapshot>, tap?: Beat['tap']) => {
    s = { ...s, ...change };
    list.push({ at, state: s, spring: snappy, tap });
  };
  go(0.9, { range: 0, updating: true }, pickerTap(1, 0, RANGE_COUNT));
  go(1.45, { loaded: 0, updating: false });
  go(2.9, { lens: 1 }, pickerTap(0, 1, LENS_COUNT));
  go(4.4, { selected: 'food' }, scene => scene.legendTap('h:food', 4.4));
  go(6.0, { selected: 'transportation' }, scene =>
    scene.sliceTap('transportation', 6.0)
  );
  go(7.5, { selected: null }, scene => scene.sliceTap('transportation', 7.5));
  go(8.7, { lens: 0 }, pickerTap(0, 0, LENS_COUNT));
  go(9.7, { range: 3, updating: true }, pickerTap(1, 3, RANGE_COUNT));
  go(10.25, { loaded: 3, updating: false });
  return list;
})();

export const duration = (beats.at(-1)?.at ?? 0) + settleTime(snappy) + 0.4;

/* -------------------------------------------------------------------------- */
/* Animated scalars                                                            */
/* -------------------------------------------------------------------------- */

const step = (spring: SwiftSpring, dt: number) =>
  dt <= 0 ? 0 : springValue(spring, 1, dt);

/**
 * One value per beat (undefined where it doesn't exist, carried over) and
 * the spring each beat moves it with; the value at `t` is the first plus
 * each later change times its step response.
 */
const track = (
  values: (number | undefined)[],
  springOf: (b: Beat) => SwiftSpring
) => {
  const first = values.find(v => v !== undefined) ?? 0;
  const filled: number[] = [];
  let last = first;
  for (const v of values) {
    if (v !== undefined) last = v;
    filled.push(last);
  }
  const changes: { at: number; delta: number; spring: SwiftSpring }[] = [];
  for (let i = 1; i < filled.length; i++) {
    const delta = (filled[i] ?? 0) - (filled[i - 1] ?? 0);
    const beat = beats[i];
    if (delta && beat)
      changes.push({ at: beat.at, delta, spring: springOf(beat) });
  }
  return (t: number) => {
    let v = filled[0] ?? 0;
    for (const c of changes) {
      if (c.at > t) break;
      v += c.delta * step(c.spring, t - c.at);
    }
    return v;
  };
};

const layoutSpring = (b: Beat) => b.spring;

/* -------------------------------------------------------------------------- */
/* numericText                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * `.contentTransition(.numericText())`: digits that change roll up out of
 * view as their replacements roll in from below, blurring on the way;
 * everything that stays slides to its new place. Apple doesn't publish the
 * transition's internals, so the travel and blur are fitted by eye.
 */
type Glyph = {
  char: string;
  inAt: number;
  outAt: number | null;
  spring: SwiftSpring;
  outSpring: SwiftSpring;
  x: (t: number) => number;
};

export type NumericLayout = { glyphs: Glyph[]; size: number };

export type Measure = (text: string, font: string) => number;

/** Digits keep their place value; other marks keep their order from the right. */
const identities = (text: string) => {
  const chars = [...text];
  let digit = 0;
  const marks = new Map<string, number>();
  const out: string[] = new Array(chars.length);
  for (let i = chars.length - 1; i >= 0; i--) {
    const c = chars[i] ?? '';
    if (/\d/.test(c)) out[i] = `d${digit++}:${c}`;
    else {
      const n = marks.get(c) ?? 0;
      marks.set(c, n + 1);
      out[i] = `${c}#${n}`;
    }
  }
  return out;
};

const numeric = (
  texts: (string | undefined)[],
  springOf: (b: Beat) => SwiftSpring,
  measure: Measure,
  font: string,
  size: number,
  align: 'right' | 'center'
): NumericLayout => {
  type Live = { glyph: Glyph; xs: (number | undefined)[] };
  const live = new Map<string, Live>();
  const all: Live[] = [];
  let previous: string | undefined;
  texts.forEach((text, i) => {
    const beat = beats[i];
    if (text === undefined || !beat || text === previous) return;
    previous = text;
    const chars = [...text];
    const widths = chars.map(c => measure(c, font));
    const width = widths.reduce((a, b) => a + b, 0);
    let x = align === 'right' ? -width : -width / 2;
    const ids = identities(text);
    const present = new Set<string>();
    chars.forEach((char, j) => {
      const id = ids[j] ?? '';
      present.add(id);
      let l = live.get(id);
      if (!l) {
        l = {
          glyph: {
            char,
            inAt: beat.at,
            outAt: null,
            spring: springOf(beat),
            outSpring: springOf(beat),
            x: () => 0
          },
          xs: new Array(texts.length).fill(undefined)
        };
        live.set(id, l);
        all.push(l);
      }
      l.xs[i] = x;
      x += widths[j] ?? 0;
    });
    for (const [id, l] of live) {
      if (present.has(id)) continue;
      l.glyph.outAt = beat.at;
      l.glyph.outSpring = springOf(beat);
      live.delete(id);
    }
  });
  for (const l of all) l.glyph.x = track(l.xs, springOf);
  return { glyphs: all.map(l => l.glyph), size };
};

export type GlyphFrame = {
  x: number;
  y: number;
  opacity: number;
  blur: number;
  scale: number;
};

/** Where every glyph of a numeric text is at `t`; null when gone. */
export const numericFrame = (
  layout: NumericLayout,
  t: number
): (GlyphFrame | null)[] => {
  const push = layout.size * 0.5;
  const blur = layout.size * 0.12;
  return layout.glyphs.map(g => {
    if (t < g.inAt) return null;
    const inP = g.inAt === 0 ? 1 : Math.min(1, step(g.spring, t - g.inAt));
    const outP =
      g.outAt === null
        ? 0
        : Math.min(1, Math.max(0, step(g.outSpring, t - g.outAt)));
    if (outP >= 0.999) return null;
    const y = push * (1 - inP) - push * outP;
    const away = Math.max(1 - inP, outP);
    return {
      x: g.x(t),
      y,
      opacity: Math.max(0, inP * (1 - outP)),
      blur: blur * away,
      scale: 1 - 0.2 * away
    };
  });
};

/* -------------------------------------------------------------------------- */
/* The scene                                                                   */
/* -------------------------------------------------------------------------- */

export type RowFrame = {
  id: RowId;
  y: number;
  opacity: number;
  /** Heading rows: 0 collapsed, 1 expanded. */
  open: number;
};

export type Scene = ReturnType<typeof buildScene>;

/** subheadline, footnote and title3 bold, at the default Dynamic Type size. */
const FONT_FIGURE = '400 15px';
const FONT_SMALL = '400 13px';
const FONT_TOTAL = '700 20px';

export const buildScene = (measure: Measure) => {
  const states = beats.map(b => b.state);
  const statsAt = states.map(stats);

  // Picker thumbs.
  const lensThumb = track(
    states.map(s => s.lens),
    () => thumb
  );
  const rangeThumb = track(
    states.map(s => s.range),
    () => thumb
  );
  const dim = track(
    states.map(s => (s.updating ? 0.5 : 1)),
    layoutSpring
  );

  // The donut, per heading: where its sector starts and ends, in turns.
  const sliceAngles = new Map<
    Heading,
    {
      a0: (t: number) => number;
      a1: (t: number) => number;
      on: (t: number) => number;
    }
  >();
  for (const h of HEADINGS) {
    const a0: (number | undefined)[] = [];
    const a1: (number | undefined)[] = [];
    statsAt.forEach(st => {
      const total = totalOf(st);
      let run = 0;
      let found = false;
      for (const [heading, cents] of slicesOf(st)) {
        if (heading === h) {
          a0.push(run / total);
          a1.push((run + cents) / total);
          found = true;
        }
        run += cents;
      }
      if (!found) {
        a0.push(undefined);
        a1.push(undefined);
      }
    });
    sliceAngles.set(h, {
      a0: track(a0, () => donut),
      a1: track(a1, () => donut),
      on: track(
        states.map(s => (s.selected === null || s.selected === h ? 1 : 0.35)),
        layoutSpring
      )
    });
  }

  // Centre of the donut.
  const total = numeric(
    statsAt.map(st => money(totalOf(st))),
    layoutSpring,
    measure,
    FONT_TOTAL,
    20,
    'center'
  );
  // The count's text is the app's, per language; the scene keeps the number.
  const counts = statsAt.map(st => String(st.count));

  // Legend.
  const legends = states.map((s, i) =>
    legendOf(statsAt[i] as Stats, s.selected)
  );
  const rowIds = [...new Set(legends.flatMap(l => l.map(r => r.id)))];
  const rows = rowIds.map(id => {
    const ys = legends.map(l => {
      let y = 0;
      for (const r of l) {
        if (r.id === id) return y;
        y += (r.id.startsWith('h:') ? HEADING_ROW_H : CATEGORY_ROW_H) + ROW_GAP;
      }
      return undefined;
    });
    const heading = id.startsWith('h:') ? (id.slice(2) as Heading) : null;
    const entry = (i: number) => legends[i]?.find(r => r.id === id);
    return {
      id,
      heading,
      y: track(ys, layoutSpring),
      opacity: track(
        legends.map(l => (l.some(r => r.id === id) ? 1 : 0)),
        layoutSpring
      ),
      open: track(
        states.map(s => (heading && s.selected === heading ? 1 : 0)),
        layoutSpring
      ),
      percent: numeric(
        states.map((_, i) => {
          const e = entry(i);
          return e ? percent(e.fraction) : undefined;
        }),
        layoutSpring,
        measure,
        heading ? FONT_FIGURE : FONT_SMALL,
        heading ? 15 : 13,
        'right'
      ),
      amount: numeric(
        states.map((_, i) => {
          const e = entry(i);
          return e ? money(e.cents) : undefined;
        }),
        layoutSpring,
        measure,
        heading ? FONT_FIGURE : FONT_SMALL,
        heading ? 15 : 13,
        'right'
      )
    };
  });

  const legendHeight = legends.map(l =>
    l.reduce(
      (h, r, i) =>
        h +
        (r.id.startsWith('h:') ? HEADING_ROW_H : CATEGORY_ROW_H) +
        (i ? ROW_GAP : 0),
      0
    )
  );
  const cardH = track(
    legendHeight.map(h => LEGEND_Y + h + CARD_PAD),
    layoutSpring
  );
  const chips = HEADINGS.map(h => ({
    heading: h,
    on: track(
      states.map(s => (s.selected === h ? 1 : 0)),
      layoutSpring
    )
  }));
  const secondY = track(
    states.map(
      (s, i) =>
        CARD_Y +
        LEGEND_Y +
        (legendHeight[i] ?? 0) +
        CARD_PAD +
        16 +
        (s.selected ? CHIP_H + 16 : 0)
    ),
    layoutSpring
  );

  // Biggest expenses.
  const tops = states.map((s, i) => topOf(statsAt[i] as Stats, s.selected));
  const topIds = [...new Set(tops.flatMap(l => l.map(r => r.id)))];
  const expenseRows = topIds.map(id => {
    const sample = tops.flat().find(r => r.id === id);
    const at = (i: number) => tops[i]?.findIndex(r => r.id === id) ?? -1;
    return {
      id,
      description: sample?.description ?? '',
      date: sample?.date ?? '',
      category: sample?.category ?? 'general',
      y: track(
        states.map((_, i) => {
          const k = at(i);
          return k < 0 ? undefined : k * (EXPENSE_ROW_H + EXPENSE_GAP);
        }),
        () => ranks
      ),
      opacity: track(
        states.map((_, i) => (at(i) < 0 ? 0 : 1)),
        () => ranks
      ),
      rank: states.map((_, i) => at(i) + 1),
      amount: numeric(
        states.map((_, i) => {
          const r = tops[i]?.find(x => x.id === id);
          return r ? money(r.cents) : undefined;
        }),
        () => ranks,
        measure,
        FONT_FIGURE,
        15,
        'right'
      )
    };
  });

  /** Which beat is current at `t`. */
  const beatAt = (t: number) => {
    let i = 0;
    while (i + 1 < beats.length && (beats[i + 1]?.at ?? Infinity) <= t) i++;
    return i;
  };

  /** Crossfade between the previous beat's text and the current one's. */
  const fade = (t: number, values: string[]) => {
    const i = beatAt(t);
    const beat = beats[i];
    const now = values[i] ?? '';
    // Find when this text last changed.
    let j = i;
    while (j > 0 && values[j - 1] === now) j--;
    const changed = beats[j];
    const before = j > 0 ? (values[j - 1] ?? '') : now;
    const p =
      changed && j > 0 ? Math.min(1, step(changed.spring, t - changed.at)) : 1;
    return { now, before, p: beat ? p : 1 };
  };

  const scene = {
    duration,
    lensThumb,
    rangeThumb,
    dim,
    sliceAngles,
    total,
    count: (t: number) => fade(t, counts),
    rows,
    cardH,
    chips,
    secondY,
    expenseRows,
    rankText: (t: number, row: (typeof expenseRows)[number]) =>
      fade(
        t,
        row.rank.map(r => (r > 0 ? String(r) : ''))
      ),
    /** The legend row's centre at its beat, for the finger. */
    legendTap(id: RowId, at: number): Tap {
      const row = rows.find(r => r.id === id);
      return {
        x: CARD_X + CARD_PAD + 60,
        y: CARD_Y + LEGEND_Y + (row?.y(at) ?? 0) + HEADING_ROW_H / 2
      };
    },
    /** Middle of a sector's ring at its beat. */
    sliceTap(h: Heading, at: number): Tap {
      const s = sliceAngles.get(h);
      const mid = s ? ((s.a0(at) + s.a1(at)) / 2) * Math.PI * 2 : 0;
      const r = (OUTER_R + INNER_R) / 2;
      return {
        x: SCREEN_W / 2 + r * Math.sin(mid),
        y: CARD_Y + DONUT_Y + DONUT_H / 2 - r * Math.cos(mid)
      };
    },
    taps: [] as { at: number; x: number; y: number }[]
  };

  scene.taps = beats.flatMap(b => {
    if (!b.tap) return [];
    const p = typeof b.tap === 'function' ? b.tap(scene as Scene) : b.tap;
    return [{ at: b.at, ...p }];
  });
  return scene;
};

/** The finger: a disc that lands 100 ms before the action and lifts with it. */
export const touchAt = (scene: Scene, t: number) =>
  scene.taps.map(tap => {
    const down = tap.at - 0.1;
    if (t < down || t > tap.at + 0.35) return null;
    const pressIn = Math.min(1, (t - down) / 0.08);
    const lift = t <= tap.at ? 0 : Math.min(1, (t - tap.at) / 0.3);
    return {
      x: tap.x,
      y: tap.y,
      opacity: pressIn * (1 - lift),
      scale: 0.7 + 0.3 * pressIn + 0.15 * lift
    };
  });

/* -------------------------------------------------------------------------- */
/* Sector geometry                                                             */
/* -------------------------------------------------------------------------- */

/**
 * SectorMark(innerRadius: .ratio(0.62), angularInset: 1.5).cornerRadius(4):
 * an annular sector, clockwise from 12 o'clock, with straight edges inset
 * 1.5 pt each side and every corner rounded.
 */
export const sectorPath = (
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  turn0: number,
  turn1: number,
  inset = 1.5,
  corner = 4
) => {
  const a0 = turn0 * Math.PI * 2;
  const a1 = turn1 * Math.PI * 2;
  if (a1 - a0 < 1e-4) return '';
  const pt = (a: number, r: number) =>
    [cx + r * Math.sin(a), cy - r * Math.cos(a)] as const;
  // Point on a sector edge: `d` along the radius, `off` across it.
  const edge = (a: number, d: number, off: number) =>
    [
      cx + d * Math.sin(a) + off * Math.cos(a),
      cy - d * Math.cos(a) + off * Math.sin(a)
    ] as const;

  for (let cr = corner; cr >= 0; cr -= 0.25) {
    const reach = (r: number, outer: boolean) => {
      const c = outer ? r - cr : r + cr;
      const s = (inset + cr) / c;
      return s >= 1 ? null : { c, phi: Math.asin(s) };
    };
    const o = reach(r1, true);
    const i = reach(r0, false);
    if (!o || !i) continue;
    if (a0 + o.phi > a1 - o.phi || a0 + i.phi > a1 - i.phi) continue;
    const f = (p: readonly [number, number]) =>
      `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
    const largeOuter = a1 - a0 - 2 * o.phi > Math.PI ? 1 : 0;
    const largeInner = a1 - a0 - 2 * i.phi > Math.PI ? 1 : 0;
    const cornerArc = (p: readonly [number, number]) =>
      `A${cr} ${cr} 0 0 1 ${f(p)}`;
    return [
      `M${f(edge(a0, o.c * Math.cos(o.phi), inset))}`,
      cornerArc(pt(a0 + o.phi, r1)),
      `A${r1} ${r1} 0 ${largeOuter} 1 ${f(pt(a1 - o.phi, r1))}`,
      cornerArc(edge(a1, o.c * Math.cos(o.phi), -inset)),
      `L${f(edge(a1, i.c * Math.cos(i.phi), -inset))}`,
      cornerArc(pt(a1 - i.phi, r0)),
      `A${r0} ${r0} 0 ${largeInner} 0 ${f(pt(a0 + i.phi, r0))}`,
      cornerArc(edge(a0, i.c * Math.cos(i.phi), inset)),
      'Z'
    ].join('');
  }
  return '';
};
