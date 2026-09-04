'use client';

import dynamic from 'next/dynamic';
import { Link } from '@/i18n/navigation';
import { useT } from '@/i18n/use-t';
import lottieAnimation from '../../../public/static/icons/404.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function NotFound() {
  const t = useT();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-nav-height-mobile">
      <h1>{t.pages.notFound.title}</h1>
      <div className="flex justify-center">
        <Lottie
          animationData={lottieAnimation}
          loop={true}
          autoPlay={true}
          style={{ width: '60%' }}
        />
      </div>
      <p>{t.pages.notFound.description}</p>
      <nav
        aria-label="Page recovery"
        className="mt-4 flex flex-wrap justify-center gap-4"
      >
        <Link href="/">{t.pages.notFound.links.home}</Link>
        <Link href="/projects">{t.pages.notFound.links.projects}</Link>
        <Link href="/contact">{t.pages.notFound.links.contact}</Link>
        <a href="/sitemap.xml">{t.pages.notFound.links.sitemap}</a>
        <a href="/llms.txt">{t.pages.notFound.links.agents}</a>
      </nav>
    </div>
  );
}
