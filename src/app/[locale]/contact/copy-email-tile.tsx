'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Specimen } from '@/components/shell/specimen';
import { cn } from '@/lib/cn';

type CopyEmailTileProps = {
  address: string;
  title: string;
  copyHint: string;
  copied: string;
};

/** The address as a tile: one click puts it on the clipboard. */
export function CopyEmailTile({
  address,
  title,
  copyHint,
  copied
}: CopyEmailTileProps) {
  const [done, setDone] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  };

  return (
    <Specimen title={title} note={done ? copied : copyHint}>
      <button
        type="button"
        onClick={copy}
        aria-label={`${copyHint}: ${address}`}
        className="flex size-full cursor-pointer flex-col items-center justify-center gap-4"
      >
        <span className="relative flex size-10 items-center justify-center rounded-full bg-white/[0.06] text-primary">
          <Copy
            aria-hidden
            className={cn(
              'absolute size-4 transition-all duration-200',
              done ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
            )}
          />
          <Check
            aria-hidden
            className={cn(
              'absolute size-4 text-[#7ee2a8] transition-all duration-200',
              done ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            )}
          />
        </span>
        <span className="text-[1.125rem] tracking-[-0.01em] text-primary">
          {address}
        </span>
      </button>
      <span aria-live="polite" className="sr-only">
        {done ? copied : ''}
      </span>
    </Specimen>
  );
}
