import { Geist, Geist_Mono } from 'next/font/google';
import { cn } from '@/lib/cn';

/**
 * Geist for the redesigned surfaces. Registered under the site's own variable
 * names, so every descendant that already reads `var(--font-sans)` or
 * `var(--font-mono)` picks it up without touching the legacy pages.
 */
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
});

export const geist = cn(geistSans.variable, geistMono.variable);
