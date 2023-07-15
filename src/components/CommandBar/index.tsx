import {
  forwardRef,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactElement,
  type Ref
} from 'react';
import { useRouter } from 'next/router';
import type { ActionImpl } from 'kbar';
import { KBarPortal, KBarProvider, KBarResults, useMatches } from 'kbar';
import Lottie, {
  type LottieComponentProps,
  type LottieRefCurrentProps
} from 'lottie-react';
import { RiGithubLine, RiInstagramLine, RiLinkedinLine } from 'react-icons/ri';
import aboutIcon from '../../../public/static/icons/about.json';
import copyLinkIcon from '../../../public/static/icons/copy-link.json';
import emailIcon from '../../../public/static/icons/email.json';
import homeIcon from '../../../public/static/icons/home.json';
import projectsIcon from '../../../public/static/icons/projects.json';
import sourceIcon from '../../../public/static/icons/source.json';
import { kbar } from '../../locales/en/common/kbar';
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

export function CommandBar({ children }: PropsWithChildren) {
  const copyLinkRef = useRef<LottieRefCurrentProps>(null);
  const emailRef = useRef<LottieRefCurrentProps>(null);
  const sourceRef = useRef<LottieRefCurrentProps>(null);
  const homeRef = useRef<LottieRefCurrentProps>(null);
  const aboutRef = useRef<LottieRefCurrentProps>(null);
  const projectsRef = useRef<LottieRefCurrentProps>(null);

  const router = useRouter();
  const [showToast, setShowToast] = useState(false);

  const copyUrl = () => {
    void navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
  };

  const iconStyle = { width: 24, height: 24 };

  type ActionType = {
    id: string;
    name: string;
    shortcut: string[];
    keywords: string;
    section: string;
    perform: () => void;
    icon: ReactElement<LottieComponentProps> | ReactElement;
  };

  const actions: ActionType[] = [
    {
      id: 'home',
      name: kbar.actions.home,
      shortcut: ['g', 'h'],
      keywords: 'go-home',
      section: kbar.sections.goto,
      perform: () => void router.push('/'),
      icon: (
        <Lottie
          lottieRef={homeRef}
          style={iconStyle}
          animationData={homeIcon}
          loop={false}
          autoplay={false}
        />
      )
    },
    {
      id: 'about',
      name: kbar.actions.about,
      shortcut: ['g', 'a'],
      keywords: 'go-about',
      section: kbar.sections.goto,
      perform: () => void router.push('/about'),
      icon: (
        <Lottie
          lottieRef={aboutRef}
          style={iconStyle}
          animationData={aboutIcon}
          loop={false}
          autoplay={false}
        />
      )
    },
    {
      id: 'projects',
      name: kbar.actions.projects,
      shortcut: ['g', 'p'],
      keywords: 'go-projects',
      section: kbar.sections.goto,
      perform: () => void router.push('/projects'),
      icon: (
        <Lottie
          lottieRef={projectsRef}
          style={iconStyle}
          animationData={projectsIcon}
          loop={false}
          autoplay={false}
        />
      )
    },
    {
      id: 'copy',
      name: kbar.actions.copy,
      shortcut: ['u'],
      keywords: 'copy-url',
      section: kbar.sections.general,
      perform: copyUrl,
      icon: (
        <Lottie
          lottieRef={copyLinkRef}
          style={iconStyle}
          animationData={copyLinkIcon}
          loop={false}
          autoplay={false}
        />
      )
    },
    {
      id: 'email',
      name: kbar.actions.email,
      shortcut: ['e'],
      keywords: 'send-email',
      section: kbar.sections.general,
      perform: () => void router.push('/contact'),
      icon: (
        <Lottie
          lottieRef={emailRef}
          style={iconStyle}
          animationData={emailIcon}
          loop={false}
          autoplay={false}
        />
      )
    },
    {
      id: 'source',
      name: kbar.actions.source,
      shortcut: ['s'],
      keywords: 'view-source',
      section: kbar.sections.general,
      perform: () =>
        window.open('https://github.com/Sn0wye/snowye.dev', '_blank'),
      icon: (
        <Lottie
          lottieRef={sourceRef}
          style={iconStyle}
          animationData={sourceIcon}
          loop={false}
          autoplay={false}
        />
      )
    },
    {
      id: 'github',
      name: 'GitHub',
      shortcut: ['f', 'g'],
      keywords: 'go-github',
      section: kbar.sections.follow,
      perform: () => window.open('https://github.com/Sn0wye', '_blank'),
      icon: <RiGithubLine />
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      shortcut: ['f', 'l'],
      keywords: 'go-linkedin',
      section: kbar.sections.follow,
      perform: () =>
        window.open('https://linkedin.com/in/gabriel-trzimajewski', '_blank'),
      icon: <RiLinkedinLine />
    },
    {
      id: 'instagram',
      name: 'Instagram',
      shortcut: ['f', 'i'],
      keywords: 'go-instagram',
      section: kbar.sections.follow,
      perform: () =>
        window.open('https://www.instagram.com/gabtrzimajewski', '_blank'),
      icon: <RiInstagramLine />
    }
  ];

  return (
    <>
      <KBarProvider actions={actions}>
        <KBarPortal>
          <Positioner>
            <Animator>
              <Search placeholder="Type a command or search…" />
              <RenderResults />
            </Animator>
          </Positioner>
        </KBarPortal>

        {children}
      </KBarProvider>

      <Toast
        title={kbar.toast.title}
        description={kbar.toast.description}
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
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <GroupName>{item}</GroupName>
        ) : (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          //FIXME
          <ResultItem action={item} active={active} />
        )
      }
    />
  );
}

interface TAction extends ActionImpl {
  icon: ReactElement<LottieComponentProps>;
}

interface ResultItemProps {
  action: TAction;
  active: boolean;
}

const ResultItem = forwardRef(
  ({ action, active }: ResultItemProps, ref: Ref<HTMLDivElement>) => {
    if (active) {
      action.icon.props.lottieRef?.current?.play();
    } else {
      action.icon.props.lottieRef?.current?.stop();
    }
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
