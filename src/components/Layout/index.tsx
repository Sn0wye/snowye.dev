import { PropsWithChildren } from 'react';
import { Footer } from '../Footer';
import { Navbar } from '../Navbar';
import { Wrapper } from './style';

export const Layout = ({ children }: PropsWithChildren) => {
  return (
    <Wrapper>
      <Navbar />
      {children}
      <Footer />
    </Wrapper>
  );
};
