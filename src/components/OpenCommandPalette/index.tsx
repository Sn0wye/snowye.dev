import { useKBar } from 'kbar';
import { useEffect, useState } from 'react';
import { Button } from '../styled/Button';

export function OpenCommandPalette() {
  const { query } = useKBar();
  const [mounted, setMounted] = useState(false);

  // This is a hack to make sure the command palette is mounted on render.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (mounted) {
    const isMac = /(Mac)/i.test(navigator.userAgent);
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

    if (isMobile) {
      return (
        <Button type='button' onClick={query.toggle}>
          Tap to start →
        </Button>
      );
    }
    if (isMac) {
      return (
        <Button type='button' onClick={query.toggle}>
          Press <kbd>⌘</kbd> <kbd>K</kbd> to start →
        </Button>
      );
    }

    //Common cases (Windows, Linux)
    return (
      <Button type='button' onClick={query.toggle}>
        Press <kbd>ctrl</kbd> <kbd>K</kbd> to start →
      </Button>
    );
  }
  return null;
}
