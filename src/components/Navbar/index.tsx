import { useKBar } from 'kbar';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  Anchor,
  Aside,
  CmdButton,
  CmdIcon,
  Header,
  Hover,
  List,
  LogoButton,
  Nav,
  NavContainer,
} from './styles';

export const pages = ['About', 'Projects'];

export function Navbar() {
  const { asPath } = useRouter();
  const [hovered, setHovered] = useState('');
  const { query } = useKBar();

  return (
    <Header>
      <Link href='/' passHref>
        <LogoButton>
          <Image
            src='/favicon.svg'
            alt='Snowflake (Snowye Icon)'
            height={32}
            width={32}
          />
        </LogoButton>
      </Link>
      <Nav>
        <List>
          {pages.map((page) => {
            const path = `/${page.toLowerCase()}`;
            const isHovered = hovered === page;

            return (
              <li key={page}>
                <Link href={path} passHref>
                  <Anchor>
                    <NavContainer
                      onHoverStart={() => setHovered(page)}
                      onHoverEnd={() => setHovered('')}
                      css={
                        asPath === path
                          ? {
                              color: '$primary',
                              '&::after': { opacity: 1 },
                            }
                          : {}
                      }
                    >
                      {isHovered && (
                        <Hover
                          layoutId='nav'
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                      {page}
                    </NavContainer>
                  </Anchor>
                </Link>
              </li>
            );
          })}
        </List>
      </Nav>
      <Aside>
        <CmdButton type='button' aria-label='Command' onClick={query.toggle}>
          <CmdIcon />
        </CmdButton>
      </Aside>
    </Header>
  );
}
