import { useKBar } from 'kbar';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useI18n } from '../../locales';
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
  NavContainer
} from './styles';

export const pages = ['about', 'projects', 'contact'] as const;

export function Navbar() {
  const { asPath } = useRouter();
  const [hovered, setHovered] = useState('');
  const { query } = useKBar();
  const { scopedT } = useI18n();
  const t = scopedT('common.navbar');

  return (
    <Header>
      <LogoButton href='/'>
        <Image
          src='/favicon.svg'
          alt='Snowflake (Snowye Icon)'
          height={32}
          width={32}
        />
      </LogoButton>
      <Nav>
        <List>
          {pages.map(page => {
            const path = `/${page.toLowerCase()}`;
            const isHovered = hovered === page;

            return (
              <li key={page}>
                <Anchor href={path}>
                  <NavContainer
                    onHoverStart={() => setHovered(page)}
                    onHoverEnd={() => setHovered('')}
                    css={
                      asPath === path
                        ? {
                            color: '$primary',
                            '&::after': { opacity: 1 }
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
                    {t(page)}
                  </NavContainer>
                </Anchor>
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
