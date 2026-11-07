import { settleTime, springValue } from '@/lib/swift-spring';

import { easeOut, springs } from './timelines';

/**
 * AmountDisplay, as a pure function of time. Each glyph's identity is its
 * position *and* its character, as in the Swift: appending leaves earlier
 * glyphs alone, replacing one retires it and introduces the new one in place.
 *
 * Glyphs that stay slide to their new place when the row re-centres. SwiftUI
 * retargets a running spring keeping its velocity; for a linear spring that
 * is exactly the sum of one step response per change, which is what `x`
 * computes, so interrupted moves stay faithful too.
 */

/** BlurPushTransition, in points at the app's 76 pt amount. */
const PUSH = 0.45 * 90;
const BLUR = 9;
const SHRINK = 0.55;
export const APP_SIZE = 76;

/** A key on the pad, as the review gallery's keypad names them. */
export type Key =
  '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.' | '0' | 'del';

/**
 * One touch on the pad. `text` is what the amount reads after it lands,
 * `at` when it lands. A tap lands on release; the long press on delete
 * lands mid-hold, at 0.45 s, and its release is swallowed.
 */
export type Keystroke = {
  at: number;
  text: string;
  key?: Key;
  down?: number;
  up?: number;
};

/** A tap's finger-down time before the action fires on release. */
const TAP = 0.09;
/** ExpenseKeypad's LongPressGesture(minimumDuration: 0.45). */
export const HOLD_TO_CLEAR = 0.45;

/** The recorded session: 1 2 4 . 5 0, three deletes, 8 9, then hold delete. */
export const script: Keystroke[] = (() => {
  const steps: [Key, string][] = [
    ['1', '1'],
    ['2', '12'],
    ['4', '124'],
    ['.', '124.'],
    ['5', '124.5'],
    ['0', '124.50'],
    ['del', '124.5'],
    ['del', '124.'],
    ['del', '124'],
    ['8', '1248'],
    ['9', '12489']
  ];
  const strokes: Keystroke[] = [{ at: 0, text: '0' }];
  steps.forEach(([key, text], i) => {
    const at = 0.6 + i * 0.38;
    strokes.push({ at, text, key, down: at - TAP, up: at });
  });
  const press = 0.6 + steps.length * 0.38 + 0.6;
  strokes.push({
    at: press + HOLD_TO_CLEAR,
    text: '0',
    key: 'del',
    down: press,
    up: press + 0.8
  });
  return strokes;
})();

export const duration = (script.at(-1)?.up ?? 0) + 1.3;

/**
 * PrimaryButton: Next is disabled while the amount is zero, its coral at
 * 35%, and `.animation(.easeOut(duration: 0.2), value: isEnabled)` between.
 */
export const nextOpacityAt = (t: number) => {
  let value = 0.35;
  let from = 0.35;
  let at = -Infinity;
  for (const stroke of script) {
    if (stroke.at > t) break;
    const target = Number(stroke.text) === 0 ? 0.35 : 1;
    if (target === value) continue;
    // Retarget from wherever the fade had got to.
    from = from + (value - from) * easeOut((stroke.at - at) / 0.2);
    value = target;
    at = stroke.at;
  }
  return from + (value - from) * easeOut((t - at) / 0.2);
};

/**
 * KeypadKeyStyle's halo: a 7% disc that fades in over 80 ms while the
 * finger is down and out over 200 ms after it lifts, never growing.
 */
export const haloAt = (key: Key, t: number) => {
  let opacity = 0;
  for (const stroke of script) {
    if (
      stroke.key !== key ||
      stroke.down === undefined ||
      stroke.up === undefined
    )
      continue;
    if (t < stroke.down) continue;
    const held = 0.07 * easeOut((Math.min(t, stroke.up) - stroke.down) / 0.08);
    opacity =
      t <= stroke.up ? held : held * (1 - easeOut((t - stroke.up) / 0.2));
  }
  return opacity;
};

type Instance = {
  key: string;
  char: string;
  insertAt: number;
  removeAt: number | null;
  /** Left edge after each stroke it lived through, with that stroke's time. */
  moves: { at: number; x: number }[];
};

export type AmountLayout = {
  instances: Instance[];
  /** The currency symbol never leaves; it only slides. */
  symbol: { moves: { at: number; x: number }[] };
};

/**
 * Lays out every stroke with real glyph widths, centred in `width`, then
 * threads glyph identities through the script.
 */
export const layout = (
  measure: (char: string) => number,
  width: number,
  symbolGap: number
): AmountLayout => {
  const live = new Map<string, Instance>();
  const instances: Instance[] = [];
  const symbolMoves: { at: number; x: number }[] = [];

  for (const stroke of script) {
    const chars = [...stroke.text];
    const total =
      measure('$') + symbolGap + chars.reduce((sum, c) => sum + measure(c), 0);
    let x = (width - total) / 2;
    symbolMoves.push({ at: stroke.at, x });
    x += measure('$') + symbolGap;

    const present = new Set<string>();
    chars.forEach((char, index) => {
      const key = `${index}-${char}`;
      present.add(key);
      let instance = live.get(key);
      if (!instance) {
        instance = {
          key,
          char,
          insertAt: stroke.at,
          removeAt: null,
          moves: []
        };
        live.set(key, instance);
        instances.push(instance);
      }
      instance.moves.push({ at: stroke.at, x });
      x += measure(char);
    });
    for (const [key, instance] of live) {
      if (!present.has(key)) {
        instance.removeAt = stroke.at;
        live.delete(key);
      }
    }
  }
  return { instances, symbol: { moves: symbolMoves } };
};

/** Position under superposed step responses, from the first placement. */
const travel = (moves: { at: number; x: number }[], t: number) => {
  const [first, ...rest] = moves;
  if (!first) return 0;
  let x = first.x;
  let previous = first.x;
  for (const move of rest) {
    if (move.at > t) break;
    x += (move.x - previous) * springValue(springs.amount, 1, t - move.at);
    previous = move.x;
  }
  return x;
};

export type GlyphFrame = {
  x: number;
  y: number;
  scale: number;
  blur: number;
  opacity: number;
};

const LINGER = settleTime(springs.amount);

/** Where every glyph is at `t`, in app points; null when not on screen. */
export const frameAt = (
  layoutResult: AmountLayout,
  t: number
): { symbolX: number; glyphs: (GlyphFrame | null)[] } => ({
  symbolX: travel(layoutResult.symbol.moves, t),
  glyphs: layoutResult.instances.map(instance => {
    if (t < instance.insertAt) return null;
    if (instance.removeAt !== null && t - instance.removeAt > LINGER)
      return null;
    const x = travel(
      instance.moves.filter(
        m => instance.removeAt === null || m.at < instance.removeAt
      ),
      t
    );
    if (instance.removeAt !== null && t >= instance.removeAt) {
      // Leaving upward: the far end of BlurPushTransition(from: .above).
      const q = springValue(springs.amount, 1, t - instance.removeAt);
      return {
        x,
        y: -PUSH * q,
        scale: 1 - (1 - SHRINK) * q,
        blur: Math.max(0, BLUR * q),
        opacity: Math.min(1, Math.max(0, 1 - q))
      };
    }
    // The first "0" is already there when the screen opens.
    if (instance.insertAt === 0)
      return { x, y: 0, scale: 1, blur: 0, opacity: 1 };
    const p = springValue(springs.amount, 1, t - instance.insertAt);
    return {
      x,
      y: PUSH * (1 - p),
      scale: SHRINK + (1 - SHRINK) * p,
      blur: Math.max(0, BLUR * (1 - p)),
      opacity: Math.min(1, Math.max(0, p))
    };
  })
});
