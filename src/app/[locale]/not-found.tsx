'use client';

import Lottie from 'lottie-react';
import dynamic from 'next/dynamic';
import { useT } from '@/i18n/use-t';
import lottieAnimation from '../../../public/static/icons/404.json';

const ShortcutError = dynamic(() => import('@/components/shortcut-error'), {
  ssr: false
});

export default function NotFound() {
  const t = useT();

  return (
    <div className='flex flex-1 flex-col items-center justify-center px-5 py-navHeightMobile'>
      <h1>{t.pages.notFound.title}</h1>
      <div className='flex justify-center'>
        <Lottie
          animationData={lottieAnimation}
          loop={true}
          autoPlay={true}
          style={{ width: '60%' }}
        />
      </div>
      <p>{t.pages.notFound.description}</p>
      <ShortcutError />
    </div>
  );
}
