'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

/** A code sample with a copy button in its corner. */
export function CodeBlock({
  children,
  label
}: {
  children: string;
  /** Names the snippet for the copy button, e.g. "client config". */
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="group relative my-5">
      <pre className="overflow-x-auto rounded-xl bg-black p-5 pr-14 font-mono text-[13px] leading-6 text-primary/90 ring-1 ring-white/10">
        <code>{children}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="absolute top-3 right-3 flex size-8 cursor-pointer items-center justify-center rounded-lg text-secondary transition-colors hover:bg-white/[0.06] hover:text-primary"
      >
        <Copy
          aria-hidden
          className={cn(
            'absolute size-4 transition-all duration-200',
            copied ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
          )}
        />
        <Check
          aria-hidden
          className={cn(
            'absolute size-4 text-[#7ee2a8] transition-all duration-200',
            copied ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          )}
        />
      </button>
    </div>
  );
}
