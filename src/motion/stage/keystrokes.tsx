'use client';

import { useEffect, useRef } from 'react';

import type { KeyCap, KeystrokeFrame } from '@/motion/keystrokes';

/** How long a cap stays pressed down after its key. */
const DIP = 0.09;

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const capHtml = (cap: KeyCap) => {
  const mods = cap.mods
    ? `<span style="color:rgb(255 255 255/.55)">${escape(cap.mods)}</span>`
    : '';
  const count =
    cap.count > 1
      ? `<span style="color:rgb(255 255 255/.45);font-size:.82em">×${cap.count}</span>`
      : '';
  // A typed space at the end of a word would be invisible; show it as a gap.
  const label = escape(cap.label).replace(/ /g, '&nbsp;');
  return `<span data-cap style="display:flex;align-items:center;gap:.3em;height:2.15em;min-width:2.15em;justify-content:center;padding:0 .7em;border-radius:.55em;background:#1d1c22;color:rgb(255 255 255/.92);box-shadow:inset 0 0 0 1px rgb(255 255 255/.12),inset 0 -2px 0 rgb(0 0 0/.45),0 6px 18px -6px rgb(0 0 0/.7);white-space:pre;transition:opacity .2s">${mods}<span>${label}</span>${count}</span>`;
};

/**
 * The keys a moment's person is pressing, as caps along the bottom of the
 * stage. Not part of the app. Drawn from a KeystrokeFrame every frame; the
 * caps are rebuilt only when one is added or changes, and a fresh press dips
 * its cap for a beat. Scales with `--keys-scale` on an ancestor.
 */
export function KeystrokeBar({
  register
}: {
  register: (draw: (frame: KeystrokeFrame, t: number) => void) => void;
}) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let last = '';
    register((frame, t) => {
      const el = bar.current;
      if (!el) return;
      const html = frame.caps.map(capHtml).join('');
      if (html !== last) {
        el.innerHTML = html;
        last = html;
      }
      el.style.opacity = String(frame.opacity);
      const caps = el.querySelectorAll<HTMLElement>('[data-cap]');
      caps.forEach((node, i) => {
        const cap = frame.caps[i];
        if (!cap) return;
        const newest = i === caps.length - 1;
        const age = t - cap.at;
        node.style.opacity = newest ? '1' : '0.5';
        node.style.transform =
          newest && age < DIP ? 'translateY(1.5px) scale(0.96)' : '';
      });
    });
  }, [register]);

  return (
    <div
      ref={bar}
      aria-hidden
      className="pointer-events-none absolute bottom-3 left-1/2 flex origin-bottom items-center gap-1.5 font-mono text-[13px]"
      style={{
        transform: 'translateX(-50%) scale(var(--keys-scale, 1))',
        opacity: 0
      }}
    />
  );
}
