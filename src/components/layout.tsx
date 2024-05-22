'use client';

import type { PropsWithChildren } from 'react';
import { Footer } from './footer';
import { Navbar } from './navbar';

export const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="relative z-0 flex min-h-screen flex-col">
      <Navbar />
      {children}
      <Footer />
      {/* <StarCanvas /> */}
    </div>
  );
};
