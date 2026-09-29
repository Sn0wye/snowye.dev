'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';

/** Digits roll one at a time; words and punctuation roll as a whole. */
const tokenize = (text: string) => text.match(/\d|\s+|[^\d\s]+/g) ?? [];

const roll = {
  enter: (direction: number) => ({ y: `${direction * 100}%`, opacity: 0 }),
  center: { y: '0%', opacity: 1 },
  exit: (direction: number) => ({ y: `${direction * -100}%`, opacity: 0 })
};

/**
 * Text that rolls like an odometer when it changes: only the digits and
 * words that differ move, the rest stays put. `direction` 1 rolls up (the
 * value went forward), -1 rolls down.
 */
export function RollingText({
  text,
  direction = 1,
  className
}: {
  text: string;
  direction?: 1 | -1;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {tokenize(text).map((token, i) =>
          /^\s+$/.test(token) ? (
            token
          ) : (
            // Slots are positional, so a slot only animates when its own
            // token changes. They clip vertically only, and glide sideways
            // when an earlier word changes width.
            <motion.span
              key={i}
              layout="position"
              transition={spring.snappy}
              className="relative inline-flex overflow-y-clip"
            >
              <AnimatePresence
                mode="popLayout"
                initial={false}
                custom={direction}
              >
                <motion.span
                  key={token}
                  custom={direction}
                  variants={roll}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={spring.snappy}
                  className="inline-block whitespace-pre"
                >
                  {token}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          )
        )}
      </span>
    </span>
  );
}

/**
 * Swaps its content when `id` changes: the old line slides up and out as the
 * new one slides in. Reduced motion keeps only the crossfade.
 */
export function SwapText({
  id,
  children,
  className
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const offset = reduced ? 0 : 6;
  const blur = reduced ? 'blur(0px)' : 'blur(2px)';

  return (
    <span className={cn('relative inline-block', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={id}
          initial={{ opacity: 0, y: offset, filter: blur }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -offset, filter: blur }}
          transition={spring.snappy}
          className="inline-block"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
