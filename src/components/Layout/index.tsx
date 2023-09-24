'use client';

import { type PropsWithChildren } from 'react';
import { Footer } from '../Footer';
import { Navbar } from '../Navbar';

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
