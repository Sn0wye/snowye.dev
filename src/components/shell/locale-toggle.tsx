'use client';

import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { type AppLocale, routing } from '@/i18n/routing';
import { useAppLocale, useT } from '@/i18n/use-t';
import { cn } from '@/lib/cn';

export function LocaleToggle({ className }: { className?: string }) {
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
    <fieldset className={cn('flex items-center gap-3', className)}>
      <legend className="sr-only">{t.common.localeSwitcher.label}</legend>
      {routing.locales.map(locale => (
        <button
          key={locale}
          type="button"
          disabled={isPending}
          onClick={() => onSelect(locale)}
          aria-current={locale === current ? 'true' : undefined}
          className={cn(
            'cursor-pointer transition-colors',
            locale === current ? 'text-primary' : 'hover:text-primary'
          )}
        >
          {locale}
        </button>
      ))}
    </fieldset>
  );
}
