import type { Metadata } from 'next';
import ClientOpenCommandPalette from '@/components/client-open-command-palette';
import { home } from '@/locales/en/pages/home';
import { Typewriter } from './typewriter';

export const metadata = {
  title: home.title,
  description: home.description,
  openGraph: {
    description: home.description
  }
} satisfies Metadata;

export default function Home() {
  return (
    <div className="mx-auto flex max-w-3xl flex-1 items-center overflow-hidden px-5 py-navHeightMobile md:w-[800px] md:px-0 md:py-navHeightDesktop">
      <main className="relative z-10 h-full bg-transparent px-5 leading-8 text-secondary">
        <h1 className="bg-gradient-to-r from-[#9442FE] to-[#3378FF] bg-clip-text text-transparent">
          {home.title}
        </h1>
        <div className="flex flex-col">
          <strong dangerouslySetInnerHTML={{ __html: home.meta }} />
          <Typewriter strings={home.description} />
        </div>
        <ClientOpenCommandPalette />
      </main>
    </div>
  );
}
