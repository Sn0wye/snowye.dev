'use client';

import Lottie from 'lottie-react';
import { ShortcutError } from '@/components/shortcut-error';
import lottieAnimation from '../../public/static/icons/404.json';
import { Layout } from '../components/layout';

export default function NotFound() {
  return (
    <Layout>
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
    </Layout>
  );
}
