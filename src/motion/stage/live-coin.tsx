'use client';

import { useEffect, useRef } from 'react';
import type { CoinTimeline } from '@/motion/splitty/timelines';

const CORAL = [0xf2, 0x54, 0x2d];
const GREEN = [0x4a, 0xde, 0x80];

const mix = (a: number[], b: number[], p: number) =>
  `rgb(${a.map((v, i) => Math.round(v + ((b[i] ?? v) - v) * p)).join(' ')})`;

/** SplittySymbol's two cuts on the 256 grid. */
const CUTS = {
  regular: { radius: 68, halfGap: 8 },
  reversed: { radius: 67, halfGap: 9 }
};

/**
 * SplittySymbol, drawn about the centre so the halves can slide along the
 * cut: each sits 40 units off centre vertically and half the gap
 * horizontally, scaled by `separation`.
 */
export function LiveCoin({
  timeline,
  cut = 'regular',
  ground,
  ink,
  onDraw
}: {
  timeline: CoinTimeline;
  cut?: keyof typeof CUTS;
  /** Background of the stage, e.g. the splash's coral. */
  ground?: string;
  /** A fixed symbol colour; otherwise coral turning green with the frame. */
  ink?: string;
  onDraw: (draw: (t: number) => void) => void;
}) {
  const whole = useRef<SVGGElement>(null);
  const a = useRef<SVGGElement>(null);
  const b = useRef<SVGGElement>(null);
  const { radius: r, halfGap } = CUTS[cut];

  useEffect(() => {
    onDraw(t => {
      const f = timeline.frame(t);
      const dx = halfGap * f.separation;
      const dy = 40 * f.separation;
      a.current?.setAttribute('transform', `translate(${-dx} ${-dy})`);
      b.current?.setAttribute('transform', `translate(${dx} ${dy})`);
      whole.current?.setAttribute(
        'transform',
        `translate(128 128) scale(${f.scale}) translate(-128 -128)`
      );
      if (!ink && whole.current)
        whole.current.style.fill = mix(CORAL, GREEN, f.green);
    });
  }, [timeline, halfGap, ink, onDraw]);

  return (
    <div
      className="flex size-full items-center justify-center"
      style={{ background: ground }}
    >
      <svg
        viewBox="0 0 256 256"
        className="size-[42%] overflow-visible"
        aria-hidden
      >
        <g ref={whole} style={{ fill: ink ?? mix(CORAL, GREEN, 0) }}>
          <g ref={a}>
            <path d={`M128 ${128 - r}A${r} ${r} 0 0 0 128 ${128 + r}Z`} />
          </g>
          <g ref={b}>
            <path d={`M128 ${128 - r}A${r} ${r} 0 0 1 128 ${128 + r}Z`} />
          </g>
        </g>
      </svg>
    </div>
  );
}
