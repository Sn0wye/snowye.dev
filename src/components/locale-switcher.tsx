'use client';

import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { type AppLocale, routing } from '@/i18n/routing';
import { useAppLocale, useT } from '@/i18n/use-t';
import { cn } from '@/lib/cn';

export function LocaleSwitcher() {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const current = useAppLocale();
  const [isPending, startTransition] = useTransition();

  const onSelect = (next: AppLocale) => {
    if (next === current) return;
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- params has dynamic shape we re-pass through
        { pathname, params },
        { locale: next }
      );
    });
  };

  return (
    <fieldset className="ml-1 flex items-center gap-0.5 rounded-lg bg-transparent p-1 text-xs font-medium uppercase tracking-[0.075em]">
      <legend className="sr-only">{t.common.localeSwitcher.label}</legend>
      {routing.locales.map(locale => {
        const isActive = locale === current;
        return (
          <button
            key={locale}
            type="button"
            disabled={isPending || isActive}
            onClick={() => onSelect(locale)}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'cursor-pointer rounded-md px-2 py-1 transition-colors duration-200 ease-in-out',
              isActive
                ? 'bg-hover text-primary'
                : 'text-secondary hover:bg-hover hover:text-primary'
            )}
          >
            {locale}
          </button>
        );
      })}
    </fieldset>
  );
}
