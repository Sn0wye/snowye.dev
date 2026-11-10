import { cubicBezier, spring } from 'motion';

import { clamp01, type Curve, springCurve, tween } from '../listas/curves';

/**
 * CloudCertify's curves. Like Listas it is a web app on Motion, so nothing
 * is ported: its CSS transitions are cubic-béziers and its springs come from
 * the same generator this site runs, asked for any instant directly.
 */

export { clamp01, type Curve };

/** Tailwind's `ease-out`, on the answer options and confidence buttons. */
export const tailwindEaseOut = cubicBezier(0, 0, 0.2, 1);
/** Tailwind's default transition curve, for `transition-all`. */
export const tailwindEase = cubicBezier(0.4, 0, 0.2, 1);
/** `--ease-out` in index.css, on every Button. */
export const appEaseOut = cubicBezier(0.23, 1, 0.32, 1);
/** Motion's named "easeOut" and "easeInOut". */
export const motionEaseOut = cubicBezier(0, 0, 0.58, 1);
export const motionEaseInOut = cubicBezier(0.42, 0, 0.58, 1);

/**
 * Seconds until Motion's spring reports itself done, which is when
 * AnimatePresence lets the next element in and onAnimationComplete fires.
 */
const settleOf = (generator: { next: (ms: number) => { done: boolean } }) => {
  for (let ms = 0; ms < 5000; ms++)
    if (generator.next(ms).done) return ms / 1000;
  return 5;
};

export const curves = {
  /** use-question-motion `spring`: question changes, the explanation, Continue. */
  question: springCurve(0.45, 0.12),
  /** pop.tsx: icons springing in on mount. */
  pop: springCurve(0.35, 0.5),
  /** Options and confidence buttons: duration-150 ease-out. */
  option: tween(0.15, tailwindEaseOut),
  /** Buttons: duration-150 ease-[var(--ease-out)]. */
  button: tween(0.15, appEaseOut),
  /** The navigator's squares and the progress bar: transition-all. */
  all: tween(0.15, tailwindEase)
};

/** The explanation opening: height 0 → its own height, plus opacity. */
export const explanationSettle = Math.max(
  settleOf(spring({ keyframes: [0, 130], duration: 450, bounce: 0.12 })),
  settleOf(spring({ keyframes: [0, 1], duration: 450, bounce: 0.12 }))
);

/**
 * Motion keyframes over `duration`, evenly spaced, each segment on `ease`:
 * the shake on a wrong pick, the nod on a right one, the stickers' float.
 */
export const keyframes =
  (values: number[], duration: number, ease: (p: number) => number) =>
  (t: number) => {
    const segments = values.length - 1;
    const p = clamp01(t / duration) * segments;
    const i = Math.min(segments - 1, Math.floor(p));
    const a = values[i] ?? 0;
    const b = values[i + 1] ?? a;
    return t <= 0 ? (values[0] ?? 0) : a + (b - a) * ease(p - i);
  };

/**
 * RotatingText's characters: `{ type: 'spring', damping: 30, stiffness: 400 }`
 * on y, in percent of the line. In from 100 %, out to -120 %.
 */
const physics = (from: number, to: number) => {
  const generator = spring({
    keyframes: [from, to],
    stiffness: 400,
    damping: 30
  });
  return {
    at: (t: number) => (t <= 0 ? from : generator.next(t * 1000).value),
    settle: settleOf(
      spring({ keyframes: [from, to], stiffness: 400, damping: 30 })
    )
  };
};
export const charIn = physics(100, 0);
export const charOut = physics(0, -120);

/* -------------------------------------------------------------------------- */
/* CSS transitions                                                             */
/* -------------------------------------------------------------------------- */

/**
 * sRGB 0–255 and alpha. Tagged `oklab` when the stylesheet wrote it as a
 * colour-mix in Oklab, as Tailwind v4 does for `bg-success/15`: a
 * transition touching one of those interpolates in Oklab, not sRGB.
 */
export type Rgba =
  [number, number, number, number] | [number, number, number, number, 'oklab'];

export const hex = (h: string, alpha = 1): Rgba => [
  Number.parseInt(h.slice(1, 3), 16),
  Number.parseInt(h.slice(3, 5), 16),
  Number.parseInt(h.slice(5, 7), 16),
  alpha
];

/** `bg-<colour>/<alpha>` in Tailwind v4: color-mix(in oklab, colour, transparent). */
export const wash = (h: string, alpha: number): Rgba => {
  const [r, g, b] = hex(h);
  return [r, g, b, alpha, 'oklab'];
};

export const rgba = (c: Rgba) =>
  `rgb(${c[0].toFixed(1)} ${c[1].toFixed(1)} ${c[2].toFixed(1)} / ${c[3].toFixed(3)})`;

const toLinear = (v: number) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const fromLinear = (v: number) => {
  const c = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  return Math.min(255, Math.max(0, c * 255));
};

/** Björn Ottosson's Oklab, from and back to sRGB. */
const toOklab = ([r8, g8, b8]: Rgba) => {
  const r = toLinear(r8);
  const g = toLinear(g8);
  const b = toLinear(b8);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ] as const;
};
const fromOklab = (L: number, A: number, B: number) => {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
  ] as const;
};

/** Colours interpolate premultiplied, as CSS transitions do, in the space CSS picks. */
export const mixRgba = (a: Rgba, b: Rgba, p: number): Rgba => {
  const alpha = a[3] + (b[3] - a[3]) * p;
  if (alpha <= 0) return [0, 0, 0, 0];
  if (a[4] === 'oklab' || b[4] === 'oklab') {
    const x = toOklab(a);
    const y = toOklab(b);
    const channel = (i: 0 | 1 | 2) =>
      (x[i] * a[3] + (y[i] * b[3] - x[i] * a[3]) * p) / alpha;
    const [r, g, bl] = fromOklab(channel(0), channel(1), channel(2));
    return [r, g, bl, alpha, 'oklab'];
  }
  const channel = (i: 0 | 1 | 2) =>
    (a[i] * a[3] + (b[i] * b[3] - a[i] * a[3]) * p) / alpha;
  return [channel(0), channel(1), channel(2), alpha];
};

const lerpNumber = (a: number, b: number, p: number) => a + (b - a) * p;

/**
 * A CSS transition on one property of one element, from the values the
 * element asks for over time. `values[i]` is what the stylesheet says at
 * `times[i]`; undefined means the element is not mounted, and a fresh mount
 * starts at its value without transitioning. A change mid-flight starts
 * from wherever the property was, the way browsers retarget.
 */
function transitionOf<T>(
  times: number[],
  values: (T | undefined)[],
  curve: Curve,
  lerp: (a: T, b: T, p: number) => T,
  same: (a: T, b: T) => boolean
) {
  type Leg = { at: number; from: T; to: T };
  const legs: (Leg | null)[] = [];
  let leg: Leg | null = null;
  const valueOf = (l: Leg, t: number) => lerp(l.from, l.to, curve(t - l.at));
  values.forEach((value, i) => {
    const at = times[i] ?? 0;
    if (value === undefined) leg = null;
    else if (!leg)
      leg = { at: Number.NEGATIVE_INFINITY, from: value, to: value };
    else if (!same(leg.to, value))
      leg = { at, from: valueOf(leg, at), to: value };
    legs.push(leg);
  });
  return (t: number): T | undefined => {
    let i = -1;
    for (let j = 0; j < times.length; j++) {
      if ((times[j] ?? 0) <= t) i = j;
      else break;
    }
    const l = legs[i];
    return l ? valueOf(l, t) : undefined;
  };
}

export const numberTransition = (
  times: number[],
  values: (number | undefined)[],
  curve: Curve
) =>
  transitionOf(
    times,
    values,
    curve,
    lerpNumber,
    (a, b) => Math.abs(a - b) < 1e-9
  );

export const colorTransition = (
  times: number[],
  values: (Rgba | undefined)[],
  curve: Curve
) =>
  transitionOf(times, values, curve, mixRgba, (a, b) =>
    a.every((v, i) =>
      typeof v === 'number'
        ? Math.abs(v - Number(b[i] ?? 0)) < 1e-9
        : v === b[i]
    )
  );
