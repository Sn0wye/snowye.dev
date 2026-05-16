'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip';
import { useT } from '@/i18n/use-t';

export function NamePronunciation() {
  const t = useT();
  const p = t.pages.about.pronunciation;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={p.label}
          className="cursor-help border-b border-dashed border-primary/60 bg-transparent p-0 font-bold text-primary transition-colors duration-200 hover:border-primary"
        >
          {p.surname}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="font-mono">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">
              {p.spellLabel}
            </span>
            <span className="text-zinc-100">{p.spell}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">
              {p.ipaLabel}
            </span>
            <span className="text-zinc-100">/{p.ipa}/</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
