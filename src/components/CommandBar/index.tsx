import {
  Action,
  KBarPortal,
  KBarProvider,
  KBarResults,
  useMatches,
} from 'kbar';
import { useRouter } from 'next/router';
import { forwardRef, PropsWithChildren, Ref, useState } from 'react';
import Toast from '../Toast';
import {
  ActionRow,
  Animator,
  GroupName,
  Icon,
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
      icon: <Icon className='ri-file-copy-line' />,
    },
    {
      id: 'source',
      name: 'View Source',
      shortcut: ['s'],
      keywords: 'view-source',
      section: 'General',
      perform: () =>
        window.open('https://github.com/Sn0wye/portfolio', '_blank'),
      icon: <Icon className='ri-braces-line' />,
    },
    {
      id: 'home',
      name: 'Home',
      shortcut: ['g', 'h'],
      keywords: 'go-home',
      section: 'Go To',
      perform: () => router.push('/'),
      icon: <Icon className='ri-home-5-line' />,
    },
    {
      id: 'about',
      name: 'About',
      shortcut: ['g', 'a'],
      keywords: 'go-about',
      section: 'Go To',
      perform: () => router.push('/about'),
      icon: <Icon className='ri-user-line' />,
    },
    {
      id: 'projects',
      name: 'Projects',
      shortcut: ['g', 'p'],
      keywords: 'go-projects',
      section: 'Go To',
      perform: () => router.push('/projects'),
      icon: <Icon className='ri-lightbulb-line' />,
    },
    {
      id: 'github',
      name: 'Github',
      shortcut: ['f', 'g'],
      keywords: 'go-github',
      section: 'Follow',
      perform: () => window.open('https://github.com/Sn0wye', '_blank'),
      icon: <Icon className='ri-github-line' />,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      shortcut: ['f', 'l'],
      keywords: 'go-linkedin',
      section: 'Follow',
      perform: () =>
        window.open('https://linkedin.com/in/gabriel-trzimajewski', '_blank'),
      icon: <Icon className='ri-linkedin-line' />,
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
        isSuccess={true}
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
