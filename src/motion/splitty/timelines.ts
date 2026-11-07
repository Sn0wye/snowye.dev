import {
  firstContact,
  settleTime,
  springValue,
  springValueFrom,
  swiftSpring
} from '@/lib/swift-spring';

/**
 * Splitty's motion as pure functions of time, ported from the Swift sources
 * at the commit in `registry.ts`. Every value here is the one SwiftUI would
 * draw at that instant: the springs are solved in closed form and match
 * SwiftUI's own `Spring` to machine precision.
 */

/** The curves, named as the app names them. */
export const springs = {
  /** SplashView: the coin settling to full size. */
  grow: swiftSpring(0.4, 0.82),
  /** SplashView: the cut landing. */
  cut: swiftSpring(0.4, 0.68),
  /** SplittyLoader: halves meeting. */
  join: swiftSpring(0.45, 0.8),
  /** SplittyLoader: halves parting. */
  part: swiftSpring(0.5, 0.62),
  /** SettledCoinMotion.close: livelier, because it stops at contact. */
  close: swiftSpring(0.5, 0.55),
  /** SettledCoinMotion.wobble: the impact, kicked with velocity 1.2. */
  wobble: swiftSpring(0.42, 0.42),
  /** AmountDisplay: every glyph. */
  amount: swiftSpring(0.34, 0.72)
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/**
 * `.easeOut`: SwiftUI's curve is Core Animation's, cubic-bezier(0, 0, 0.58,
 * 1). Solved for the curve parameter by bisection, since x(s) is monotonic.
 */
export const easeOut = (p: number) => {
  const x = clamp01(p);
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 32; i++) {
    const s = (lo + hi) / 2;
    if (1.74 * (1 - s) * s * s + s * s * s < x) lo = s;
    else hi = s;
  }
  const s = (lo + hi) / 2;
  return 3 * (1 - s) * s * s + s * s * s;
};

export type CoinFrame = {
  separation: number;
  scale: number;
  /** 0 is the brand coral, 1 the positive green. */
  green: number;
};

export type CoinTimeline = {
  duration: number;
  frame: (t: number) => CoinFrame;
  /** Instants worth marking on the curve, in seconds. */
  marks: { at: number; label: string }[];
};

/**
 * SettledCoin: 200 ms of stillness, then the halves close on a lively spring
 * that is cut off the first time it reaches the target, so they stop dead
 * instead of sliding through each other. The impact becomes a wobble.
 */
export const settledCoin = (): CoinTimeline => {
  const delay = 0.2;
  const contact = firstContact(springs.close);
  const wobbleFor = 1;
  const hold = 0.9;
  return {
    duration: delay + contact + wobbleFor + hold,
    marks: [
      { at: delay, label: 'close' },
      { at: delay + contact, label: 'contact' }
    ],
    frame: t => {
      const closing = t - delay;
      const green = closing <= 0 ? 0 : easeOut(closing / 0.4);
      if (closing <= 0) return { separation: 1, scale: 1, green };
      if (closing < contact) {
        const progress = Math.min(springValue(springs.close, 1, closing), 1);
        return { separation: 1 - progress, scale: 1, green };
      }
      const since = closing - contact;
      const scale =
        since < wobbleFor
          ? 1 + springValueFrom(springs.wobble, 0, 0, 1.2, since)
          : 1;
      return { separation: 0, scale, green };
    }
  };
};

/**
 * SplashView: after an 80 ms beat for the launch frame, the whole coin
 * grows from 0.86, and 100 ms later the cut lands and slides the halves out.
 */
export const splash = (): CoinTimeline => {
  const beat = 0.08;
  const cutDelay = 0.1;
  const hold = 1;
  return {
    duration: beat + cutDelay + settleTime(springs.cut) + hold,
    marks: [
      { at: beat, label: 'grow' },
      { at: beat + cutDelay, label: 'cut' }
    ],
    frame: t => {
      const grow = t - beat;
      const cut = grow - cutDelay;
      return {
        scale:
          grow <= 0 ? 0.86 : 0.86 + 0.14 * springValue(springs.grow, 1, grow),
        separation: cut <= 0 ? 0 : springValue(springs.cut, 1, cut),
        green: 0
      };
    }
  };
};

/**
 * SplittyLoader: a PhaseAnimator between 1 and 0. Meeting uses `join`;
 * parting waits 120 ms and uses the bouncier `part`. Each phase hands over
 * when its spring has settled.
 */
export const loader = (): CoinTimeline => {
  const joinFor = settleTime(springs.join, 0.005);
  const partDelay = 0.12;
  const partFor = settleTime(springs.part, 0.005);
  return {
    duration: joinFor + partDelay + partFor,
    marks: [
      { at: 0, label: 'join' },
      { at: joinFor + partDelay, label: 'part' }
    ],
    frame: t => {
      if (t < joinFor) {
        return {
          separation: 1 - springValue(springs.join, 1, t),
          scale: 1,
          green: 0
        };
      }
      const parting = t - joinFor - partDelay;
      return {
        separation: parting <= 0 ? 0 : springValue(springs.part, 1, parting),
        scale: 1,
        green: 0
      };
    }
  };
};

/** One curve per spring the moment uses, sampled for the chart. */
export const curveFor = (
  timeline: CoinTimeline,
  key: keyof CoinFrame,
  samples = 240
) =>
  Array.from({ length: samples + 1 }, (_, i) => {
    const t = (i / samples) * timeline.duration;
    return { t, v: timeline.frame(t)[key] };
  });
