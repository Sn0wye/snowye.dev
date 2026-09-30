import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * A labelled band of a document page: the heading sits in its own column on
 * wide screens and above the content on narrow ones.
 */
export function Section({
  title,
  id,
  children,
  className
}: {
  title: string;
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        'grid scroll-mt-24 gap-4 border-white/[0.06] border-t py-12 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-10',
        className
      )}
    >
      <h2 className="text-primary">{title}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/**
 * For copy that ships as HTML (`<strong>`, `<a>`, `<code>`): emphasis turns
 * white rather than bold, links get a quiet underline.
 */
export const richText =
  '[&_strong]:font-normal [&_strong]:text-primary [&_a]:text-primary [&_a]:underline [&_a]:decoration-white/25 [&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:decoration-white/70 [&_code]:rounded [&_code]:bg-white/[0.06] [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-primary';
