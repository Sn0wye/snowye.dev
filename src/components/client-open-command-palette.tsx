'use client';

import dynamic from 'next/dynamic';

const OpenCommandPalette = dynamic(
  () => import('@/components/open-command-palette'),
  { ssr: false }
);

export default function ClientOpenCommandPalette() {
  return <OpenCommandPalette />;
}
