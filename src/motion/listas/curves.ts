import { cubicBezier, spring } from 'motion';

/**
 * Listas' curves. The app is on the web, so there is nothing to port: its
 * CSS transitions are cubic-béziers, and its springs come from Motion, the
 * same library this site runs. Motion's spring generator is a closed form,
 * so asking it for any instant gives the value the app draws then.
 */

/** A curve from seconds since its start to progress, 0 → 1 (springs may overshoot). */
export type Curve = (t: number) => number;

/** `--ease-out` in the app's globals.css, also its Motion tweens. */
export const easeOut = cubicBezier(0.23, 1, 0.32, 1);
/** Motion's default tween ease, used where a transition gives only a duration. */
export const easeInOut = cubicBezier(0.42, 0, 0.58, 1);
/** CSS `ease`. */
export const ease = cubicBezier(0.25, 0.1, 0.25, 1);
/** Tailwind's `transition-colors`. */
export const tailwindEase = cubicBezier(0.4, 0, 0.2, 1);
/** Motion's layout transition when the element sets none (the list itself). */
export const layoutEase = cubicBezier(0.4, 0, 0.1, 1);

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const tween =
  (duration: number, easing: (p: number) => number, delay = 0): Curve =>
  t => {
    const p = (t - delay) / duration;
    return p <= 0 ? 0 : p >= 1 ? 1 : easing(p);
  };

/** Motion's `{ type: "spring", duration, bounce }`, from its own generator. */
export const springCurve = (duration: number, bounce: number): Curve => {
  const generator = spring({
    keyframes: [0, 1],
    duration: duration * 1000,
    bounce
  });
  return t => (t <= 0 ? 0 : generator.next(t * 1000).value);
};

/**
 * Reorder.Item lets go with dragSnapToOrigin: Motion's drag settles back to
 * its slot on a spring of stiffness 200 and damping 40, from `from` px off.
 */
export const snapBack = (from: number): Curve => {
  const generator = spring({
    keyframes: [from, 0],
    stiffness: 200,
    damping: 40,
    restDelta: 1,
    restSpeed: 10
  });
  return t => (t <= 0 ? from : generator.next(t * 1000).value);
};

/** Every transition the app declares, named for where it is declared. */
export const curves = {
  /** ItemRow SPRING: rows changing place, a swipe snapping back. */
  row: springCurve(0.45, 0),
  /** ItemRow: a row coming in. */
  enterOpacity: tween(0.18, easeInOut),
  enterShift: tween(0.2, easeOut),
  /** ItemRow: a row going out. */
  exitOpacity: tween(0.18, easeInOut),
  exitHeight: tween(0.22, easeInOut),
  /** ItemRow onDragEnd: the row leaving to the left. */
  swipeAway: tween(0.18, easeOut),
  /** Reorder.Item whileDrag: the shadow, on Motion's default tween. */
  lift: tween(0.3, easeInOut),
  /** ItemRow whileTap. */
  press: tween(0.12, easeInOut),
  /** globals.css .check-box, .check-path, .strike. */
  boxColour: tween(0.15, tailwindEase),
  check: tween(0.2, easeOut, 0.06),
  strike: tween(0.26, easeOut),
  dim: tween(0.2, ease),
  /** ProgressRing: the arc, and the check at 100%. */
  ring: tween(0.4, easeOut),
  ringCheck: springCurve(0.45, 0.35),
  /** "Limpar concluídos" fading in. */
  clear: tween(0.15, easeInOut),
  /** The list's own layout animation. */
  layout: tween(0.45, layoutEase),
  /** PresenceStack avatars, in and out and sliding over. */
  avatar: springCurve(0.35, 0.2),
  /** ItemRow: the colour of whoever is on the item. */
  here: tween(0.25, easeInOut),
  /** TypingIndicator inside the composer. */
  typing: tween(0.2, easeOut),
  /** Toast. */
  toast: springCurve(0.45, 0),
  /** .press:active. */
  pressCss: tween(0.16, easeOut)
};

/** globals.css @keyframes check-pop: 1 → 0.82 at 40% → 1, eased per segment, 320 ms. */
export const checkPop = (t: number) => {
  const p = t / 0.32;
  if (p <= 0 || p >= 1) return 1;
  return p < 0.4
    ? 1 - 0.18 * easeOut(p / 0.4)
    : 0.82 + 0.18 * easeOut((p - 0.4) / 0.6);
};

/**
 * globals.css @keyframes typing-breathe: 0.35 → 1 → 0.35 over 1.2 s, eased
 * in-out per half, after an `animation-delay`. Until the delay is over the
 * dot sits at its own opacity, 1.
 */
export const breathe = (t: number, delay: number) => {
  const since = t - delay;
  if (since < 0) return 1;
  const p = (since % 1.2) / 1.2;
  return p < 0.5
    ? 0.35 + 0.65 * easeInOut(p / 0.5)
    : 1 - 0.65 * easeInOut((p - 0.5) / 0.5);
};

/**
 * A CSS transition between 0 and 1 that flips at each of `toggles`, starting
 * at 0; a flip mid-flight starts from where it was.
 */
export const flipping = (toggles: number[], curve: Curve) => (t: number) => {
  let from = 0;
  let to = 0;
  let start = Number.NEGATIVE_INFINITY;
  const at = (time: number) => from + (to - from) * curve(time - start);
  for (const toggle of toggles) {
    if (toggle > t) break;
    from = at(toggle);
    to = 1 - to;
    start = toggle;
  }
  return at(t);
};
