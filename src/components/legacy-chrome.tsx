'use client';

import type { ReactNode } from 'react';
import { usePathname } from '@/i18n/navigation';

/**
 * Routes on the new design. They bring their own header and footer, so the
 * legacy navbar, footer and particles stay out of their way. Delete this
 * component once every page has moved over.
 */
const REDESIGNED = new Set(['/', '/projects']);

export function LegacyChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return REDESIGNED.has(pathname) ? null : children;
}
