'use client';

import { useEffect, useState } from 'react';
import { useCommandPalette } from '@/components/command-palette-store';
import { cn } from '@/lib/cn';

/**
 * Opens the command palette. The keys press down whenever the real ⌘/Ctrl
 * and K do, so the shortcut teaches itself.
 */
export function ShortcutButton({ className }: { className?: string }) {
  const toggle = useCommandPalette(state => state.toggle);
  const [mod, setMod] = useState('⌘');
  const [pressed, setPressed] = useState({ mod: false, k: false });

  useEffect(() => {
    if (!/Mac|iPhone|iPad/i.test(navigator.userAgent)) setMod('Ctrl');

    let release: ReturnType<typeof setTimeout>;
    const isMod = (key: string) => key === 'Meta' || key === 'Control';
    const down = (event: KeyboardEvent) => {
      const k = event.key.toLowerCase() === 'k';
      if (!isMod(event.key) && !k) return;
      setPressed(p => ({ mod: p.mod || isMod(event.key), k: p.k || k }));
      // macOS never sends keyup for keys pressed while ⌘ is held.
      if (k) {
        clearTimeout(release);
        release = setTimeout(() => setPressed(p => ({ ...p, k: false })), 180);
      }
    };
    const up = (event: KeyboardEvent) => {
      if (isMod(event.key)) setPressed({ mod: false, k: false });
      if (event.key.toLowerCase() === 'k')
        setPressed(p => ({ ...p, k: false }));
    };
    const reset = () => setPressed({ mod: false, k: false });

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', reset);
    return () => {
      clearTimeout(release);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', reset);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Open command palette"
      className={cn('group flex cursor-pointer items-center gap-1', className)}
    >
      <Key pressed={pressed.mod}>{mod}</Key>
      <Key pressed={pressed.k}>K</Key>
    </button>
  );
}

function Key({
  pressed,
  children
}: {
  pressed: boolean;
  children: React.ReactNode;
}) {
  return (
    <kbd
      className={cn(
        'flex h-6 min-w-6 items-center justify-center rounded-md bg-white/[0.07] px-1.5 font-sans text-[12px] text-white/70 transition-all duration-75',
        pressed
          ? 'translate-y-px bg-white/[0.16] text-white shadow-none'
          : 'shadow-[0_2px_0_0_rgba(255,255,255,0.08)] group-hover:bg-white/10 group-hover:text-white'
      )}
    >
      {children}
    </kbd>
  );
}
