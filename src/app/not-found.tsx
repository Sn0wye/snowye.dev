'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import lottieAnimation from '../../public/static/icons/404.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

// Catches any unmatched route outside the [locale] segment.
// next-intl middleware normally rewrites unknown paths into a locale,
// so this is a safety net for static/edge cases. Hardcoded to English.
export default function GlobalNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-nav-height-mobile">
      <h1>four oh four</h1>
      <div className="flex justify-center">
        <Lottie
          animationData={lottieAnimation}
          loop={true}
          autoPlay={true}
          style={{ width: '60%' }}
        />
      </div>
      <p>
        {"This page doesn't exist or may have moved. Choose where to go next:"}
      </p>
      <nav
        aria-label="Page recovery"
        className="mt-4 flex flex-wrap justify-center gap-4"
      >
        <Link href="/">Home</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/sitemap.xml">Sitemap</Link>
        <Link href="/llms.txt">Agent instructions</Link>
      </nav>
    </div>
  );
}
