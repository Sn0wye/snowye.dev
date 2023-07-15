'use client';

import { type PropsWithChildren } from 'react';
import { Footer } from '../Footer';
import { Navbar } from '../Navbar';
import { StarCanvas } from '../Stars';
import { Wrapper } from './style';

export const Layout = ({ children }: PropsWithChildren) => {
  return (
    <Wrapper>
      <Navbar />
      {children}
      <Footer />
      <StarCanvas />
    </Wrapper>
  );
};
