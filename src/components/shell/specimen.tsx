import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type SpecimenProps = {
  title: string;
  note: string;
  children: ReactNode;
  className?: string;
  /** Opens in a new tab; the whole pane becomes the link. */
  href?: string;
} & Omit<React.HTMLAttributes<HTMLElement>, 'title'>;

/**
 * One tile of the craft grid: a live pane with its caption underneath, in
 * place of a heading above.
 */
export function Specimen({
  title,
  note,
  children,
  className,
  href,
  ...pane
}: SpecimenProps) {
  const paneClass = cn(
    'group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-white/[0.035] ring-1 ring-white/[0.05] ring-inset transition-colors',
    href && 'hover:bg-white/[0.055]',
    className
  );

  return (
    <figure>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={title}
          className={paneClass}
          {...pane}
        >
          {children}
        </a>
      ) : (
        <div className={paneClass} {...pane}>
          {children}
        </div>
      )}
      <figcaption className="mt-3">
        <span className="block text-primary">{title}</span>
        <span className="block text-[13px] text-secondary/70">{note}</span>
      </figcaption>
    </figure>
  );
}
