'use client';

import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect } from 'react';

import type { AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import type { Moment, Project } from '@/motion/registry';
import { MomentStage, MomentTile, type StageCopy } from '@/motion/stage/stage';

/** Tiles and the open stage, per project frame: a phone, a terminal or a browser. */
const frames = {
  phone: {
    grid: 'sm:grid-cols-2 lg:grid-cols-3',
    tile: 'aspect-[4/5]',
    stage: 'aspect-[4/5] h-[min(64svh,44rem)] max-w-[calc(100vw-2.5rem)]'
  },
  wide: {
    grid: 'sm:grid-cols-2',
    tile: 'aspect-[8/5]',
    stage: 'aspect-[8/5] w-[min(64rem,calc(100vw-2.5rem),calc(64svh*1.6))]'
  },
  browser: {
    grid: 'sm:grid-cols-2',
    tile: 'aspect-[5/4]',
    stage: 'aspect-[5/4] w-[min(58rem,calc(100vw-2.5rem),calc(72svh*1.25))]'
  }
};

type GalleryCopy = {
  live: string;
  recording: string;
  close: string;
  previous: string;
  next: string;
  stage: StageCopy;
};

/**
 * Every project's moments as live tiles. Choosing one grows its tile into
 * the middle of the screen, over a blurred page, with the player's controls
 * underneath. The open moment lives in the URL (/craft/<slug>), so it can be
 * shared and the back button closes it.
 */
export function Gallery({
  projects,
  moments,
  locale,
  copy
}: {
  projects: Project[];
  moments: Moment[];
  locale: AppLocale;
  copy: GalleryCopy;
}) {
  const pathname = usePathname();
  const match = pathname.match(/^(.*?)\/craft(?:\/([^/]+))?\/?$/);
  const prefix = match?.[1] ?? '';
  const open = moments.find(m => m.slug === match?.[2]) ?? null;
  const index = open ? moments.indexOf(open) : -1;
  const openFrame =
    frames[projects.find(p => p.slug === open?.project)?.frame ?? 'phone'];

  const go = useCallback(
    (slug: string | null, replace = false) => {
      const url = slug ? `${prefix}/craft/${slug}` : `${prefix}/craft`;
      if (replace) window.history.replaceState(null, '', url);
      else window.history.pushState(null, '', url);
    },
    [prefix]
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      const next =
        moments[(index + direction + moments.length) % moments.length];
      if (next) go(next.slug, true);
    },
    [moments, index, go]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') go(null);
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    // The page underneath should not scroll while a moment is open.
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = overflow;
    };
  }, [open, go, step]);

  return (
    <LayoutGroup>
      {projects.map(project => {
        const frame = frames[project.frame ?? 'phone'];
        return (
          <section key={project.slug} className="mt-20">
            <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-white/[0.06] border-b pb-5">
              <div>
                <h2 className="font-medium text-[1.5rem] text-primary tracking-[-0.03em]">
                  {project.name}
                </h2>
                <p className="mt-1 max-w-xl text-[14px]">
                  {project.tagline[locale]}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-[13px]">
                <span className="font-mono text-[11px] text-secondary/60">
                  {project.stack}
                </span>
                <span className="flex gap-4">
                  {project.links.map(link => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-1 transition-colors hover:text-primary"
                    >
                      {link.label}
                      <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  ))}
                </span>
              </div>
            </header>

            <div
              className={cn('grid grid-cols-1 gap-x-5 gap-y-10', frame.grid)}
            >
              {moments
                .filter(m => m.project === project.slug)
                .map(moment => (
                  <figure key={moment.slug}>
                    <button
                      type="button"
                      onClick={() => go(moment.slug)}
                      aria-label={moment.title[locale]}
                      className={cn(
                        'group relative block w-full cursor-zoom-in rounded-2xl text-left',
                        frame.tile
                      )}
                    >
                      {/* The open moment's tile steps aside for the stage; the
                        empty slot keeps the grid from closing up. */}
                      {open?.slug !== moment.slug && (
                        <MomentTile
                          slug={moment.slug}
                          kind={moment.live}
                          project={moment.project}
                          recording={moment.live ? undefined : moment.recording}
                          className="size-full ring-1 ring-white/[0.06] ring-inset transition-shadow group-hover:ring-white/[0.16]"
                        />
                      )}
                    </button>
                    <figcaption className="mt-3">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-primary">
                          {moment.title[locale]}
                        </span>
                        <span className="font-mono text-[10px] text-secondary/60 uppercase tracking-wider">
                          {moment.live ? copy.live : copy.recording}
                        </span>
                      </span>
                      <span className="mt-1 block text-[13px] text-secondary/80">
                        {moment.summary[locale]}
                      </span>
                    </figcaption>
                  </figure>
                ))}
            </div>
          </section>
        );
      })}

      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-[#08070b]/70 backdrop-blur-2xl"
          />
        )}
        {open && (
          // Not faded: the stage arrives by growing out of its tile.
          <motion.div
            key="dialog"
            role="dialog"
            aria-modal
            aria-label={open.title[locale]}
            exit={{ transition: { duration: 0.5 } }}
            className="fixed inset-0 z-50 overflow-y-auto"
            // Clicks on empty space close it; anything marked
            // data-dismiss is empty space around the stage.
            onClick={event => {
              const target = event.target as HTMLElement;
              if (target === event.currentTarget || 'dismiss' in target.dataset)
                go(null);
            }}
          >
            <div
              data-dismiss
              className="flex min-h-full flex-col items-center justify-center px-5 py-16"
            >
              <MomentStage
                key={open.slug}
                slug={open.slug}
                project={open.project}
                live={open.live}
                recording={open.recording}
                copy={copy.stage}
                frameClassName={openFrame.stage}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2 } }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className="mt-5 max-w-md text-center"
              >
                <p className="text-primary">{open.title[locale]}</p>
                <p className="mt-1 text-[13px] text-secondary/80">
                  {open.summary[locale]}
                </p>
                {open.recording && (
                  <p className="mt-2 text-[11px] text-secondary/50">
                    {open.recording.origin[locale]}
                  </p>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.15 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
            >
              <button
                type="button"
                onClick={() => go(null)}
                aria-label={copy.close}
                className="fixed top-5 right-5 flex size-10 items-center justify-center rounded-full bg-white/[0.06] text-primary ring-1 ring-white/10 transition-colors hover:bg-white/[0.12]"
              >
                <X className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={copy.previous}
                className="fixed top-1/2 left-5 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.06] text-primary ring-1 ring-white/10 transition-colors hover:bg-white/[0.12] md:flex"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={copy.next}
                className="fixed top-1/2 right-5 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.06] text-primary ring-1 ring-white/10 transition-colors hover:bg-white/[0.12] md:flex"
              >
                <ChevronRight className="size-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
