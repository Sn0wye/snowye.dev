'use client';

import { useEffect, useState } from 'react';

let loaded = false;

/**
 * True only on the page the visitor landed on, false after any client-side
 * navigation. Intro animations use it so they play once per visit instead of
 * replaying (and fighting the page transition) every time a page mounts.
 * Server render and hydration both see `true`, so the markup matches.
 */
export function useFirstLoad() {
  const [first] = useState(() => !loaded);
  return first;
}

/**
 * Mounted once in the locale layout: after the landing page hydrates, every
 * later page counts as a navigation, whichever page the visitor landed on.
 *
 * It also names the root snapshot inline on <html>. React drops the root
 * from a view transition unless <html> names it inline, and page transitions
 * slide that snapshot (see globals.css). Set here rather than in the markup
 * so the served HTML stays untouched.
 */
export function FirstLoadMarker() {
  useEffect(() => {
    loaded = true;
    document.documentElement.style.viewTransitionName = 'root';
  }, []);
  return null;
}
