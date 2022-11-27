import { useKBar } from 'kbar';
import { useEffect, useState } from 'react';
import { useI18n } from '../../locales';
import { Button } from '../styled/Button';

export function OpenCommandPalette() {
  const { query } = useKBar();
  const [mounted, setMounted] = useState(false);
  const { scopedT } = useI18n();
  const t = scopedT('common.kbar.start');

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
          {t('mobile')}
        </Button>
      );
    }
    if (isMac) {
      return (
        <Button type='button' onClick={query.toggle}>
          {t('mac', {
            keys: (
              <>
                <kbd>⌘</kbd> <kbd>K</kbd>
              </>
            )
          })}
        </Button>
      );
    }

    //Common cases (Windows, Linux)
    return (
      <Button type='button' onClick={query.toggle}>
        {t('pc', {
          keys: (
            <>
              <kbd>ctrl</kbd> <kbd>K</kbd>
            </>
          )
        })}
      </Button>
    );
  }
  return null;
}
