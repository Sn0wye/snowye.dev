/**
 * The site's motion vocabulary. Springs are for things that answer a
 * gesture; the ease is for things that arrive. The CSS side (view
 * transitions, keyframes) mirrors these in globals.css as `--ease-out` and
 * the `--vt-*` durations, so JS and CSS motion feel like one system.
 */
export const spring = {
  /** Small, quick responses: highlights, toggles, indicators. */
  snappy: { type: 'spring', bounce: 0.15, duration: 0.3 },
  /** Surfaces that open or close: dialogs, panels. */
  soft: { type: 'spring', bounce: 0.18, duration: 0.35 }
} as const;

export const ease = {
  /** Fast start, long settle. Same curve as `--ease-out` in CSS. */
  out: [0.22, 1, 0.36, 1]
} as const;

/**
 * Page order for directional navigation: moving right through this list
 * slides forward, moving left slides back.
 */
export const PAGE_ORDER = [
  '/',
  '/about',
  '/projects',
  '/cv',
  '/mcp',
  '/contact',
  '/privacy'
] as const;

/**
 * The view-transition types for a navigation from `from` to `to`: the
 * direction, plus `leave-home` / `enter-home` when the name travels between
 * the home page and the header. Between inner pages the name stays put.
 */
export const directionTo = (from: string, to: string) => {
  const a = PAGE_ORDER.indexOf(from as (typeof PAGE_ORDER)[number]);
  const b = PAGE_ORDER.indexOf(to as (typeof PAGE_ORDER)[number]);
  if (a === -1 || b === -1 || a === b) return [];
  const types = [b > a ? 'nav-forward' : 'nav-back'];
  if (from === '/') types.push('leave-home');
  if (to === '/') types.push('enter-home');
  return types;
};
