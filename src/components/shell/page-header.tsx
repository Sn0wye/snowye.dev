import { Fragment, ViewTransition } from 'react';
import { Link } from '@/i18n/navigation';
import { getT } from '@/i18n/server-t';
import { cn } from '@/lib/cn';
import { directionTo } from '@/lib/motion';
import { LocaleToggle } from './locale-toggle';
import { ShortcutButton } from './shortcut-button';

/** Top bar for redesigned inner pages. `current` is the page's own path. */
export async function PageHeader({ current }: { current: string }) {
  const t = await getT();
  const pages = [
    { label: t.common.navbar.about, href: '/about' },
    { label: t.common.navbar.projects, href: '/projects' },
    { label: 'CV', href: '/cv' },
    { label: t.common.navbar.mcp, href: '/mcp' },
    { label: t.common.navbar.contact, href: '/contact' }
  ];

  return (
    // Anchored during page transitions: the content moves, the header does
    // not (see ::view-transition-group(site-header) in globals.css).
    <header
      style={{ viewTransitionName: 'site-header' }}
      className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 text-[13px]"
    >
      <nav aria-label="Pages" className="flex flex-wrap items-center gap-x-4">
        <Link
          href="/"
          transitionTypes={directionTo(current, '/')}
          className="mr-2 font-semibold tracking-[-0.04em] text-primary transition-opacity hover:opacity-80"
        >
          {/* Each word pairs with the same word on the home page, so the
              name morphs between the two. Weight and tracking match the
              home name, so the snapshots scale without stretching. */}
          {['Gabriel', 'Trzimajewski'].map((word, w) => (
            <Fragment key={word}>
              {w > 0 && ' '}
              <ViewTransition
                name={`site-name-${w}`}
                share="morph"
                default="none"
              >
                <span className="inline-block leading-[1.02]">{word}</span>
              </ViewTransition>
            </Fragment>
          ))}
        </Link>
        {pages.map(page => {
          const isCurrent = page.href === current;
          return (
            <Link
              key={page.href}
              href={page.href}
              transitionTypes={directionTo(current, page.href)}
              aria-current={isCurrent ? 'page' : undefined}
              className={cn(
                'relative transition-colors hover:text-primary',
                isCurrent && 'text-primary'
              )}
            >
              {page.label}
              {isCurrent && (
                // One underline per page, sharing a name, so it slides from
                // the old page's link to the new one.
                <ViewTransition
                  name="nav-indicator"
                  share="morph"
                  default="none"
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1.5 h-px bg-primary"
                  />
                </ViewTransition>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-5">
        <LocaleToggle />
        <ShortcutButton />
      </div>
    </header>
  );
}
