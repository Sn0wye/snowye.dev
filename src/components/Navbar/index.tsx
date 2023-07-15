import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useKBar } from 'kbar';
import { Command, Snowflake } from 'lucide-react';
import {
  Anchor,
  Aside,
  CmdButton,
  Header,
  Hover,
  List,
  LogoButton,
  Nav,
  NavContainer
} from './styles';

export const pages = ['about', 'projects', 'contact'] as const;

export function Navbar() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState('');
  const { query } = useKBar();

  return (
    <Header>
      <LogoButton href="/">
        <Snowflake
          aria-label="Snowflake (Snowye Icon)"
          width={24}
          height={24}
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
                      pathname === path
                        ? {
                            color: '$primary',
                            '&::after': { opacity: 1 }
                          }
                        : {}
                    }
                  >
                    {isHovered && (
                      <Hover
                        layoutId="nav"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                    {page}
                  </NavContainer>
                </Anchor>
              </li>
            );
          })}
        </List>
      </Nav>
      <Aside>
        <CmdButton
          type="button"
          aria-label="Open Command Palette"
          onClick={query.toggle}
        >
          <Command width={24} height={24} />
        </CmdButton>
      </Aside>
    </Header>
  );
}
