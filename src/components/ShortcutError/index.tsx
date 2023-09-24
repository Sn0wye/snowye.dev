'use client';

import { Button } from '../styled/Button';

export const ShortcutError = () => {
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

  if (isMobile) {
    return (
      <Button as="a" href="/">
        Tap to go home →
      </Button>
    );
  }

  return (
    <Button as="a" href="/">
      Press <kbd>G</kbd> <kbd>H</kbd> to go home →
    </Button>
  );
};
