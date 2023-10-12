'use client';

import { useEffect, useState } from 'react';
import { useCommandPalette } from './command-palette';
import { Kbd } from './kbd';

export function OpenCommandPalette() {
  const { toggle } = useCommandPalette();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      return;
    }
  }, [isMounted]);

  const isMac = isMounted ? /(Mac)/i.test(navigator.userAgent) : false;
  const isMobile = isMounted
    ? /iPhone|iPad|Android/i.test(navigator.userAgent)
    : false;

  const getContent = () => {
    if (isMobile) {
      return 'Tap to start';
    }

    if (isMac) {
      return (
        <>
          Press <Kbd size="sm">⌘</Kbd> <Kbd size="sm">K</Kbd> to start
        </>
      );
    }

    //Common cases (Windows, Linux)
    return (
      <>
        Press <Kbd size="sm">ctrl</Kbd> <Kbd size="sm">K</Kbd> to start
      </>
    );
  };

  const content = getContent();

  if (!isMounted) {
    return null;
  }

  return (
    <button
      className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-transparent px-3 py-2 font-semibold leading-6 text-primary transition-colors ease-in-out hover:bg-hover"
      type="button"
      onClick={toggle}
    >
      {content}
    </button>
  );
}
