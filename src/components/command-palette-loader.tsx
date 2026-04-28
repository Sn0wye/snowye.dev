'use client';

import dynamic from 'next/dynamic';

// kbar imports stylis which calls `document.createElement` at module load.
// Loading via `next/dynamic` from inside a Client Component prevents the
// kbar module graph from being pulled into the server bundle entirely.
export const CommandPalette = dynamic(
  () =>
    import('@/components/command-palette').then(mod => ({
      default: mod.CommandPalette
    })),
  { ssr: false }
);
