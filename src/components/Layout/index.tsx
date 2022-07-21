import { PropsWithChildren } from 'react';
import Navbar from '../Navbar';
import { Wrapper } from './style';

export const Layout = ({ children }: PropsWithChildren) => {
  return (
    <Wrapper>
      <Navbar />
      {children}
    </Wrapper>
  );
};
