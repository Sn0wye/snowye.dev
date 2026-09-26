import { Link } from '@/i18n/navigation';
import { getT } from '@/i18n/server-t';
import { cn } from '@/lib/cn';
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
    <header className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 text-[13px]">
      <nav aria-label="Pages" className="flex flex-wrap items-center gap-x-4">
        <Link
          href="/"
          className="mr-2 font-medium text-primary transition-opacity hover:opacity-80"
        >
          Gabriel Trzimajewski
        </Link>
        {pages.map(page => (
          <Link
            key={page.href}
            href={page.href}
            aria-current={page.href === current ? 'page' : undefined}
            className={cn(
              'transition-colors hover:text-primary',
              page.href === current && 'text-primary'
            )}
          >
            {page.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-5">
        <LocaleToggle />
        <ShortcutButton />
      </div>
    </header>
  );
}
