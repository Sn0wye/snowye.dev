import type { Action } from 'kbar';
import { KBarPortal, KBarProvider, KBarResults, useMatches } from 'kbar';
import Lottie, { LottieComponentProps, LottieRefCurrentProps } from 'lottie-react';
import { useRouter } from 'next/router';
import { forwardRef, PropsWithChildren, ReactElement, Ref, useRef, useState } from 'react';
import { RiGithubLine, RiInstagramLine, RiLinkedinLine } from 'react-icons/ri';
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
  StyledAction
} from './styles';

import aboutIcon from '../../../public/static/icons/about.json';
import copyLinkIcon from '../../../public/static/icons/copy-link.json';
import emailIcon from '../../../public/static/icons/email.json';
import homeIcon from '../../../public/static/icons/home.json';
import projectsIcon from '../../../public/static/icons/projects.json';
import sourceIcon from '../../../public/static/icons/source.json';

export default function CommandBar({ children }: PropsWithChildren) {
  const copyLinkRef = useRef<LottieRefCurrentProps>(null)
  const emailRef = useRef<LottieRefCurrentProps>(null)
  const sourceRef = useRef<LottieRefCurrentProps>(null)
  const homeRef = useRef<LottieRefCurrentProps>(null)
  const aboutRef = useRef<LottieRefCurrentProps>(null)
  const projectsRef = useRef<LottieRefCurrentProps>(null)

  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
  };

  const iconStyle = { width: 24, height: 24 }


  const actions = [
    {
      id: 'copy',
      name: 'Copy URL',
      shortcut: ['u'],
      keywords: 'copy-url',
      section: 'General',
      perform: copyUrl,
      icon: <Lottie lottieRef={copyLinkRef} style={iconStyle} animationData={copyLinkIcon} loop={false} autoplay={false} />,

    },
    {
      id: 'email',
      name: 'Send Email',
      shortcut: ['e'],
      keywords: 'send-email',
      section: 'General',
      perform: () => router.push('/contact'),
      icon: <Lottie lottieRef={emailRef} style={iconStyle} animationData={emailIcon} loop={false} autoplay={false} />,
    },
    {
      id: 'source',
      name: 'View Source',
      shortcut: ['s'],
      keywords: 'view-source',
      section: 'General',
      perform: () =>
        window.open('https://github.com/Sn0wye/snowye.dev', '_blank'),
      icon: <Lottie lottieRef={sourceRef} style={iconStyle} animationData={sourceIcon} loop={false} autoplay={false} />,
    },
    {
      id: 'home',
      name: 'Home',
      shortcut: ['g', 'h'],
      keywords: 'go-home',
      section: 'Go To',
      perform: () => router.push('/'),
      icon: <Lottie lottieRef={homeRef} style={iconStyle} animationData={homeIcon} loop={false} autoplay={false} />,
    },
    {
      id: 'about',
      name: 'About',
      shortcut: ['g', 'a'],
      keywords: 'go-about',
      section: 'Go To',
      perform: () => router.push('/about'),
      icon: <Lottie lottieRef={aboutRef} style={iconStyle} animationData={aboutIcon} loop={false} autoplay={false} />,
    },
    {
      id: 'projects',
      name: 'Projects',
      shortcut: ['g', 'p'],
      keywords: 'go-projects',
      section: 'Go To',
      perform: () => router.push('/projects'),
      icon: <Lottie lottieRef={projectsRef} style={iconStyle} animationData={projectsIcon} loop={false} autoplay={false} />,
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

interface TAction extends Action {
  icon: ReactElement<LottieComponentProps>;
}

interface ResultItemProps {
  action: TAction;
  active: boolean;
}

const ResultItem = forwardRef(
  ({ action, active }: ResultItemProps, ref: Ref<HTMLDivElement>) => {

    if (active) {
      action.icon.props.lottieRef?.current?.play()
    } else {
      action.icon.props.lottieRef?.current?.stop()
    }
    console.log(action.icon.props)
  
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
