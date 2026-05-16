'use client';

import dynamic from 'next/dynamic';
import lottieAnimation from '../../public/static/icons/404.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const ShortcutError = dynamic(() => import('@/components/shortcut-error'), {
  ssr: false
});

// Catches any unmatched route outside the [locale] segment.
// next-intl middleware normally rewrites unknown paths into a locale,
// so this is a safety net for static/edge cases. Hardcoded to English.
export default function GlobalNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-navHeightMobile">
      <h1>four oh four</h1>
      <div className="flex justify-center">
        <Lottie
          animationData={lottieAnimation}
          loop={true}
          autoPlay={true}
          style={{ width: '60%' }}
        />
      </div>
      <p>{"This page doesn't exist"}</p>
      <ShortcutError />
    </div>
  );
}
