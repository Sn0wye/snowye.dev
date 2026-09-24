'use client';

import { useState } from 'react';
import {
  syllablesOf,
  usePronunciation
} from '@/components/shell/use-pronunciation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip';
import { useT } from '@/i18n/use-t';
import { cn } from '@/lib/cn';

/**
 * The surname, with how to say it on hover and the recording on click. The
 * syllables light up in step with the audio.
 */
export function PronounceSurname() {
  const t = useT();
  const p = t.pages.about.pronunciation;
  const { parts, separator } = syllablesOf(p.spell);
  const voice = usePronunciation(parts.length);
  // Stays open while the recording plays, even after the pointer leaves.
  const [hovered, setHovered] = useState(false);

  return (
    <Tooltip open={hovered || voice.playing} onOpenChange={setHovered}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={voice.play}
          aria-label={p.label}
          className="cursor-pointer text-primary underline decoration-white/30 decoration-dashed underline-offset-4 transition-colors hover:decoration-white/70"
        >
          {p.surname}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <span className="flex items-baseline gap-2">
          <span className="text-white/40">{p.spellLabel}</span>
          <span>
            {parts.map((part, i) => (
              <span key={`${part}-${i}`}>
                <span
                  className={cn(
                    'transition-colors duration-150',
                    voice.current === -1 || voice.current === i
                      ? 'text-white'
                      : 'text-white/30'
                  )}
                >
                  {part}
                </span>
                {i < parts.length - 1 && (
                  <span className="text-white/30">{separator}</span>
                )}
              </span>
            ))}
          </span>
        </span>
        <span className="mt-1 flex items-baseline gap-2">
          <span className="text-white/40">{p.ipaLabel}</span>
          <span className="font-mono">/{p.ipa}/</span>
        </span>
      </TooltipContent>
    </Tooltip>
  );
}
