'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useKBar } from 'kbar';
import { Command, Snowflake } from 'lucide-react';
import { cn } from '@/lib/cn';

export const pages = ['about', 'projects', 'contact'] as const;

export function Navbar() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState('');
  const { query } = useKBar();

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
        <ul className="relative top-[5px] inline-flex justify-around">
          {pages.map(page => {
            const path = `/${page.toLowerCase()}`;
            const isHovered = hovered === page;

            return (
              <li key={page}>
                <Link
                  href={path}
                  className="border-0 hover:opacity-100 focus:opacity-100"
                >
                  <motion.span
                    className={cn(
                      'relative inline-block cursor-pointer p-5 text-xs font-medium uppercase tracking-[0.075em] text-secondary transition-colors duration-200 ease-in-out hover:text-primary',
                      pathname === path && 'text-primary after:opacity-100',
                      "after:absolute after:left-0 after:right-0 after:top-[1.125rem] after:mx-auto after:h-px after:w-5 after:bg-white after:opacity-0 after:transition-opacity after:duration-200 after:ease-in-out after:content-['']"
                    )}
                    onHoverStart={() => setHovered(page)}
                    onHoverEnd={() => setHovered('')}
                  >
                    {isHovered && (
                      <motion.span
                        layoutId="nav"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-0 right-0 top-[7px] -z-10 rounded-lg bg-hover p-5"
                      />
                    )}
                    {page}
                  </motion.span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <aside className="order-2 ml-auto mr-3 flex items-center">
        <button
          type="button"
          aria-label="Open Command Palette"
          className="flex cursor-pointer items-center justify-center rounded-lg bg-transparent p-2 transition-colors duration-200 ease-in-out hover:bg-hover"
          onClick={query.toggle}
        >
          <Command className="h-6 w-6" />
        </button>
      </aside>
    </header>
  );
}
