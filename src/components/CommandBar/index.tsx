import type { Action } from 'kbar';
import { KBarPortal, KBarProvider, KBarResults, useMatches } from 'kbar';
import { useRouter } from 'next/router';
import type { PropsWithChildren, Ref } from 'react';
import { forwardRef, useState } from 'react';
import {
  RiBracesLine,
  RiFileCopyLine,
  RiGithubLine,
  RiHome5Line,
  RiInstagramLine,
  RiLightbulbLine,
  RiLinkedinLine,
  RiMailLine,
  RiUserLine,
} from 'react-icons/ri';
import { Toast } from '../Toast';
import {
  ActionRow,
  Animator,
  GroupName,
  Kbd,
  Positioner,
  ResultStyle,
  Search,
  Shortcut,
  StyledAction,
} from './styles';

export default function CommandBar({ children }: PropsWithChildren) {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
  };

  const actions = [
    {
      id: 'copy',
      name: 'Copy URL',
      shortcut: ['u'],
      keywords: 'copy-url',
      section: 'General',
      perform: copyUrl,
      icon: <RiFileCopyLine />,
    },
    {
      id: 'email',
      name: 'Send Email',
      shortcut: ['e'],
      keywords: 'send-email',
      section: 'General',
      perform: () => router.push('/contact'),
      icon: <RiMailLine />,
    },
    {
      id: 'source',
      name: 'View Source',
      shortcut: ['s'],
      keywords: 'view-source',
      section: 'General',
      perform: () =>
        window.open('https://github.com/Sn0wye/snowye.dev', '_blank'),
      icon: <RiBracesLine />,
    },
    {
      id: 'home',
      name: 'Home',
      shortcut: ['g', 'h'],
      keywords: 'go-home',
      section: 'Go To',
      perform: () => router.push('/'),
      icon: <RiHome5Line />,
    },
    {
      id: 'about',
      name: 'About',
      shortcut: ['g', 'a'],
      keywords: 'go-about',
      section: 'Go To',
      perform: () => router.push('/about'),
      icon: <RiUserLine />,
    },
    {
      id: 'projects',
      name: 'Projects',
      shortcut: ['g', 'p'],
      keywords: 'go-projects',
      section: 'Go To',
      perform: () => router.push('/projects'),
      icon: <RiLightbulbLine />,
    },
    {
      id: 'github',
      name: 'Github',
      shortcut: ['f', 'g'],
      keywords: 'go-github',
      section: 'Follow',
      perform: () => window.open('https://github.com/Sn0wye', '_blank'),
      icon: <RiGithubLine />,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      shortcut: ['f', 'l'],
      keywords: 'go-linkedin',
      section: 'Follow',
      perform: () =>
        window.open('https://linkedin.com/in/gabriel-trzimajewski', '_blank'),
      icon: <RiLinkedinLine />,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      shortcut: ['f', 'i'],
      keywords: 'go-instagram',
      section: 'Follow',
      perform: () =>
        window.open('https://www.instagram.com/gabtrzimajewski', '_blank'),
      icon: <RiInstagramLine />,
    },
  ];

  return (
    <>
      <KBarProvider actions={actions}>
        <KBarPortal>
          <Positioner>
            <Animator>
              <Search placeholder='Type a command or search…' />
              <RenderResults />
            </Animator>
          </Positioner>
        </KBarPortal>

        {children}
      </KBarProvider>

      <Toast
        title='Copied :D'
        description='You can now share it with anyone.'
        isSuccess
        showToast={showToast}
        setShowToast={setShowToast}
      />
    </>
  );
}
function RenderResults() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }: any) =>
        typeof item === 'string' ? (
          <GroupName>{item}</GroupName>
        ) : (
          <ResultItem action={item} active={active} />
        )
      }
    />
  );
}

interface ResultItemProps {
  action: Action;
  active: boolean;
}

const ResultItem = forwardRef(
  ({ action, active }: ResultItemProps, ref: Ref<HTMLDivElement>) => {
    return (
      <ResultStyle ref={ref} active={active}>
        <StyledAction>
          {action.icon && action.icon}
          <ActionRow>
            <span>{action.name}</span>
          </ActionRow>
        </StyledAction>
        {action.shortcut?.length && (
          <Shortcut aria-hidden>
            {action.shortcut.map((shortcut: string) => (
              <Kbd key={shortcut}>{shortcut}</Kbd>
            ))}
          </Shortcut>
        )}
      </ResultStyle>
    );
  }
);

ResultItem.displayName = 'ResultItem';
