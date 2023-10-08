'use client';

import { Footer } from '../Footer';
import { Navbar } from '../Navbar';

type Color = 'purple' | 'cyan' | 'yellow' | 'pink' | 'red' | 'orange' | 'green';

interface BaseProps {
  children: React.ReactNode;
  title: string;
  tagline: string;
  primaryColor: Color;
  secondaryColor: Color;
}

export function Base({
  children,
  primaryColor,
  secondaryColor,
  tagline,
  title
}: BaseProps) {
  return (
    <div className="relative z-0 flex min-h-screen flex-col">
      <Navbar />
      <main
        className={`selection: flex-1 overflow-hidden py-navHeightMobile md:py-navHeightDesktop selection:bg-geist-${primaryColor} selection:text-black`}
      >
        <div className="relative z-10 mx-auto h-full max-w-3xl bg-transparent px-5 py-5 text-base leading-8 text-secondary">
          <h1
            className={`bg-gradient-to-br decoration-clone bg-clip-text text-transparent from-geist-${primaryColor} to-geist-${secondaryColor}`}
          >
            {tagline ? tagline : title}
          </h1>
          {children}
        </div>
      </main>
      <Footer />
      {/* <StarCanvas /> */}
    </div>
  );
}
