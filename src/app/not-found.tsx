'use client';

import Lottie from 'lottie-react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { usePlausible } from 'next-plausible';
import { useEffect } from 'react';
import lottieAnimation from '../../public/static/icons/404.json';

const ShortcutError = dynamic(() => import('@/components/shortcut-error'), {
  ssr: false
});

export default function NotFound() {
  const pathname = usePathname();
  const plausible = usePlausible();

  useEffect(() => {
    plausible('404', {
      props: {
        path: pathname
      }
    });
  }, [plausible, pathname]);

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
      <p>This page doesn&apos;t exist</p>
      <ShortcutError />
    </div>
  );
}
