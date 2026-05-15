'use client';

import { motion } from 'framer-motion';
import { Command, Snowflake } from 'lucide-react';
import { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useT } from '@/i18n/use-t';
import { cn } from '@/lib/cn';
import { useCommandPalette } from './command-palette';
import { LocaleSwitcher } from './locale-switcher';

export const pages = ['about', 'projects', 'contact'] as const;

export function Navbar() {
  const t = useT();
  const pathname = usePathname();
  const [hovered, setHovered] = useState('');
  const { toggle } = useCommandPalette();

  return (
    <header className="absolute top-0 z-30 mt-3 flex min-h-[3.75rem] w-full flex-wrap items-center text-xs text-white md:mt-0">
      <Link
        href="/"
        className="order-1 ml-3 flex cursor-pointer appearance-none items-center justify-center rounded-lg border-none bg-transparent p-2 font-heading font-bold text-white transition-colors duration-200 ease-in-out hover:bg-hover"
      >
        <Snowflake
          aria-label="Snowflake (Snowye Icon)"
          className="h-6 w-6"
          width={24}
          height={24}
        />
      </Link>
      <nav className="order-3 flex-1 basis-full overflow-x-auto overflow-y-hidden text-center md:order-2 md:basis-[initial]">
        <ul className="relative top-[5px] inline-flex list-none justify-around">
          {pages.map(page => {
            const path = `/${page.toLowerCase()}`;
            const isHovered = hovered === page;
            const label = t.common.navbar[page];

            return (
              <li key={page} className="relative">
                <span
                  onMouseEnter={() => setHovered(page)}
                  onMouseLeave={() => setHovered('')}
                >
                  {isHovered && (
                    <motion.span
                      layoutId="nav"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute -z-10 rounded-lg bg-hover top-1/2 left-0 right-0 -translate-y-1/2 p-5"
                    />
                  )}
                  <Link
                    href={path}
                    className={cn(
                      'relative inline-block cursor-pointer border-0 px-5 py-3 text-xs font-medium uppercase tracking-[0.075em] text-secondary transition-all duration-300 ease-in-out hover:text-primary hover:opacity-100 focus:opacity-100',
                      "after:absolute after:bottom-[0.375rem] after:left-1/2 after:block after:h-px after:w-5 after:-translate-x-1/2 after:bg-white after:opacity-0 after:transition-all after:duration-300 after:ease-in-out after:content-['']",
                      pathname === path && 'text-primary after:opacity-100',
                    )}
                  >
                    {label}
                  </Link>
                </span>
              </li>
            );
          })}
        </ul>
      </nav>
      <aside className="order-2 ml-auto mr-3 flex items-center gap-1">
        <LocaleSwitcher />
        <button
          type="button"
          aria-label="Open Command Palette"
          className="flex cursor-pointer items-center justify-center rounded-lg bg-transparent p-2 transition-colors duration-200 ease-in-out hover:bg-hover"
          onClick={toggle}
        >
          <Command className="h-6 w-6" />
        </button>
      </aside>
    </header>
  );
}
