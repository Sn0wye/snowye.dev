'use client';

import { useKBar } from 'kbar';
import { Button } from '../styled/Button';

export function OpenCommandPalette() {
  const { query } = useKBar();

  const isMac = /(Mac)/i.test(navigator.userAgent);
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

  if (isMobile) {
    return (
      <Button type="button" onClick={query.toggle}>
        Tap to start →
      </Button>
    );
  }

  if (isMac) {
    return (
      <Button type="button" onClick={query.toggle}>
        Press <kbd>⌘</kbd> <kbd>K</kbd> to start →
      </Button>
    );
  }

  //Common cases (Windows, Linux)
  return (
    <Button type="button" onClick={query.toggle}>
      Press <kbd>ctrl</kbd> <kbd>K</kbd> to start →
    </Button>
  );
}
