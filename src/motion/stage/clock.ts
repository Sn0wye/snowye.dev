'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * One requestAnimationFrame loop per stage, writing straight to the DOM
 * through `draw`. Nothing re-renders per frame, so the only limit on frame
 * rate is the display: 120 Hz on ProMotion, 60 elsewhere.
 *
 * Time is owned here rather than read from the wall clock, which is what
 * makes pause, slow motion and scrubbing exact: `draw(t)` is a pure
 * function, so any instant can be shown without replaying the ones before.
 */
export type Clock = {
  /** Current time in seconds, within [0, duration]. */
  time: () => number;
  playing: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (t: number) => void;
  /** Listeners run every frame after `draw`, for playheads and readouts. */
  subscribe: (listener: (t: number) => void) => () => void;
};

export function useClock({
  duration,
  draw,
  speed,
  active,
  loop = true,
  initial = 0
}: {
  duration: number;
  draw: (t: number) => void;
  /** Playback rate; 1 is real time. */
  speed: number;
  /** Off screen or hidden: the loop sleeps. */
  active: boolean;
  loop?: boolean;
  /** Where to start, e.g. where the same moment was in its tile. */
  initial?: number;
}): Clock {
  const time = useRef(initial);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const listeners = useRef(new Set<(t: number) => void>());
  const [playing, setPlaying] = useState(true);

  const emit = () => {
    drawRef.current(time.current);
    for (const listener of listeners.current) listener(time.current);
  };

  useEffect(() => {
    if (!active || !playing) {
      emit();
      return;
    }
    let frame = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      // Clamped so a tab coming back from the background does not jump.
      const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;
      let next = time.current + dt * speedRef.current;
      if (next >= duration) next = loop ? next % duration : duration;
      time.current = next;
      emit();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, playing, duration, loop]);

  return {
    time: () => time.current,
    playing,
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    toggle: () => setPlaying(p => !p),
    seek: t => {
      time.current = Math.min(Math.max(t, 0), duration);
      emit();
    },
    subscribe: listener => {
      listeners.current.add(listener);
      return () => listeners.current.delete(listener);
    }
  };
}

/**
 * The display's real refresh rate, from the median gap between frames.
 * Rounded to the common rates so a busy frame does not read as 117 Hz.
 */
export function useRefreshRate() {
  const [hz, setHz] = useState<number | null>(null);
  useEffect(() => {
    const gaps: number[] = [];
    let last = 0;
    let frame = 0;
    const tick = (now: number) => {
      if (last) gaps.push(now - last);
      last = now;
      if (gaps.length < 90) {
        frame = requestAnimationFrame(tick);
        return;
      }
      gaps.sort((a, b) => a - b);
      const median = gaps[Math.floor(gaps.length / 2)] ?? 16.7;
      const raw = 1000 / median;
      const common = [60, 75, 90, 120, 144, 165, 240];
      setHz(
        common.reduce((best, r) =>
          Math.abs(r - raw) < Math.abs(best - raw) ? r : best
        )
      );
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return hz;
}
