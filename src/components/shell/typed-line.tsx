'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

type TypedLineProps = {
  text: string;
  /** Milliseconds before the first character. */
  delay?: number;
  className?: string;
};

/**
 * Types `text` out once with a blinking caret. The full sentence is always in
 * the served HTML for crawlers and screen readers; only the visible copy
 * animates.
 */
export function TypedLine({ text, delay = 500, className }: TypedLineProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(text.length);
      return;
    }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setCount(i);
      if (i < text.length) timer = setTimeout(tick, 42 + Math.random() * 30);
    };
    timer = setTimeout(tick, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  return (
    <p className={cn('min-h-[1.7em]', className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, count)}
        <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-caret bg-current" />
      </span>
    </p>
  );
}
