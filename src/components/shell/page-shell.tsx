import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { getT } from '@/i18n/server-t';
import { PageHeader } from './page-header';
import { SocialLinks } from './social-links';
import { TypedLine } from './typed-line';

type PageShellProps = {
  /** The page's own path, so the header can mark it current. */
  current: string;
  title: string;
  /** Typed out under the title, the same way the home page types its line. */
  tagline?: string;
  children: ReactNode;
};

/**
 * Every inner page: header, a title that types its tagline, the page body,
 * and a quiet footer. The home page is the one exception; it carries its
 * own identity column instead.
 */
export async function PageShell({
  current,
  title,
  tagline,
  children
}: PageShellProps) {
  const t = await getT();

  return (
    <div className="mx-auto min-h-svh w-full max-w-[68rem] flex-1 px-6 pt-8 pb-12 text-[15px] leading-[1.7]">
      <PageHeader current={current} />

      <main className="mt-24">
        <div className="max-w-2xl">
          <h1 className="text-[2.5rem] font-medium leading-none tracking-[-0.035em] text-primary">
            {title}
          </h1>
          {tagline && (
            <TypedLine
              text={tagline}
              delay={300}
              className="mt-4 text-[1.125rem] text-primary/85"
            />
          )}
        </div>
        {children}
      </main>

      <footer className="mt-32 flex flex-wrap items-center justify-between gap-4 border-white/[0.06] border-t pt-8 text-[13px]">
        <SocialLinks />
        <Link href="/privacy" className="transition-colors hover:text-primary">
          {t.pages.privacy.navLabel}
        </Link>
      </footer>
    </div>
  );
}
