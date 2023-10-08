'use client';

import { useEffect, useState } from 'react';
import { Kbd } from '../kbd';

export const ShortcutError = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      return;
    }
  }, [isMounted]);

  const isMobile = isMounted
    ? /iPhone|iPad|Android/i.test(navigator.userAgent)
    : false;

  if (isMobile) {
    return (
      <a
        className="cursor-pointer rounded-lg border-0 bg-transparent px-3 py-2 font-semibold leading-6 text-primary transition-colors ease-in-out hover:bg-hover"
        href="/"
      >
        Tap to go home →
      </a>
    );
  }

  return (
    <a
      className="flex cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent px-3 py-2 font-semibold leading-6 text-primary transition-colors ease-in-out hover:bg-hover"
      href="/"
    >
      Press{' '}
      <Kbd size="sm" className="mx-1">
        G
      </Kbd>{' '}
      <Kbd size="sm" className="mr-1">
        H
      </Kbd>{' '}
      to go home →
    </a>
  );
};
