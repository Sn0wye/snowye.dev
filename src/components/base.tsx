'use client';

import { cn } from '@/lib/cn';

type Color = 'purple' | 'cyan' | 'yellow' | 'pink' | 'red' | 'orange' | 'green';

/**
 * Tailwind scans source files as plain text, so a class assembled at runtime
 * (`selection:bg-geist-${color}`) is never generated. These maps keep every
 * class literal and therefore visible to the scanner.
 */
const SELECTION_BG: Record<Color, string> = {
  purple: 'selection:bg-geist-purple',
  cyan: 'selection:bg-geist-cyan',
  yellow: 'selection:bg-geist-yellow',
  pink: 'selection:bg-geist-pink',
  red: 'selection:bg-geist-red',
  orange: 'selection:bg-geist-orange',
  green: 'selection:bg-geist-green'
};

const GRADIENT_FROM: Record<Color, string> = {
  purple: 'from-geist-purple',
  cyan: 'from-geist-cyan',
  yellow: 'from-geist-yellow',
  pink: 'from-geist-pink',
  red: 'from-geist-red',
  orange: 'from-geist-orange',
  green: 'from-geist-green'
};

const GRADIENT_TO: Record<Color, string> = {
  purple: 'to-geist-purple',
  cyan: 'to-geist-cyan',
  yellow: 'to-geist-yellow',
  pink: 'to-geist-pink',
  red: 'to-geist-red',
  orange: 'to-geist-orange',
  green: 'to-geist-green'
};

interface BaseProps {
  children: React.ReactNode;
  title: string;
  tagline: string;
  primaryColor: Color;
  secondaryColor: Color;
}

export function Base({
  children,
  primaryColor,
  secondaryColor,
  tagline,
  title
}: BaseProps) {
  return (
    <div className="relative z-0 flex min-h-screen flex-col">
      <main
        className={cn(
          'flex-1 overflow-hidden py-nav-height-mobile md:py-nav-height-desktop selection:text-black',
          SELECTION_BG[primaryColor]
        )}
      >
        <div className="relative z-10 mx-auto h-full max-w-3xl bg-transparent px-5 py-5 text-base leading-8 text-secondary">
          <h1
            className={cn(
              'bg-linear-to-br box-decoration-clone bg-clip-text text-transparent',
              GRADIENT_FROM[primaryColor],
              GRADIENT_TO[secondaryColor]
            )}
          >
            {tagline ? tagline : title}
          </h1>
          {children}
        </div>
      </main>
      {/* <StarCanvas /> */}
    </div>
  );
}
