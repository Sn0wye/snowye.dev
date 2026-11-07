'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Kbd } from '@/components/kbd';
import { cn } from '@/lib/cn';
import { useTimeScale } from '@/lib/time-scale';

/** The inline hint; the key lights up while it is held. */
export function SlowMoHint({ text }: { text: string }) {
  const { shift } = useTimeScale();
  const [before, after] = text.split('{key}');

  return (
    <p className="mt-4 hidden items-center gap-1.5 text-[13px] text-secondary/70 sm:flex">
      {before}
      <Kbd
        shift
        size="sm"
        className={cn(
          'aspect-auto! h-6 gap-1 px-1.5 transition-all duration-150',
          shift && 'translate-y-px bg-primary text-background'
        )}
      >
        Shift
      </Kbd>
      {after}
    </p>
  );
}

/** Floats at the bottom of the screen while time is slowed. */
export function SlowMoBadge({ label }: { label: string }) {
  const { scale } = useTimeScale();

  return (
    <AnimatePresence>
      {scale !== 1 && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-900/90 px-3.5 py-1.5 text-[12px] text-primary shadow-[0_12px_32px_-12px_rgba(0,0,0,0.9)] ring-1 ring-white/10 backdrop-blur-md"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-amber-300" />
          {label}
          <span className="font-mono text-secondary tabular-nums">
            {scale}×
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
