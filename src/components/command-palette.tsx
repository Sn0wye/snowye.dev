'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import React, {
  createContext,
  type ReactElement,
  useContext,
  useEffect,
  useRef,
  useTransition
} from 'react';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

import type { LottieComponentProps, LottieRefCurrentProps } from 'lottie-react';

import { useHotkeys } from 'react-hotkeys-hook';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { useAppLocale, useT } from '@/i18n/use-t';
import { cn } from '@/lib/cn';
import aboutIcon from '../../public/static/icons/about.json';
import copyLinkIcon from '../../public/static/icons/copy-link.json';
import emailIcon from '../../public/static/icons/email.json';
import homeIcon from '../../public/static/icons/home.json';
import mcpIcon from '../../public/static/icons/mcp.json';
import projectsIcon from '../../public/static/icons/projects.json';
import sourceIcon from '../../public/static/icons/source.json';
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Command as CommandRoot
} from './command';
import { useCommandPalette } from './command-palette-store';
import { SocialIcon } from './social-icons';
import { toast } from './use-toast';

export { useCommandPalette };

/** The cmdk value of the highlighted item, so each item can react to it. */
const SelectedContext = createContext('');

export function CommandPalette() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [inputValue, setInputValue] = React.useState('');
  const [selected, setSelected] = React.useState('');
  const { isOpen, setIsOpen, toggle } = useCommandPalette();
  const reduced = useReducedMotion();
  const t = useT();
  const k = t.common.kbar;

  const [pages, setPages] = React.useState<string[]>(['home']);
  const activePage = pages[pages.length - 1];
  const isHome = activePage === 'home';

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = useAppLocale();
  const [, startTransition] = useTransition();

  const navigate = (to: string) => {
    if (pathname === to) {
      return;
    }
    router.push(to);
    setIsOpen(false);
  };

  const switchLocale = (next: AppLocale) => {
    setIsOpen(false);
    if (next === currentLocale) return;
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- params has dynamic shape we re-pass through
        { pathname, params },
        { locale: next }
      );
    });
  };

  useHotkeys('mod+k', () => toggle());

  // shortcut listeners
  useHotkeys('g+h', () => navigate('/'), { preventDefault: true });
  useHotkeys('g+a', () => navigate('/about'), { preventDefault: true });
  useHotkeys('g+p', () => navigate('/projects'), { preventDefault: true });
  useHotkeys('g+m', () => navigate('/mcp'), { preventDefault: true });
  useHotkeys(
    'u',
    async () => {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: k.toast.title,
        description: k.toast.description
      });
    },
    { preventDefault: true }
  );
  useHotkeys('e', () => navigate('/contact'), { preventDefault: true });
  useHotkeys(
    's',
    () => {
      window.open('https://github.com/Sn0wye/snowye.dev', '_blank');
    },
    { preventDefault: true }
  );
  useHotkeys(
    'f+g',
    () => {
      window.open('https://github.com/Sn0wye/snowye.dev', '_blank');
    },
    { preventDefault: true }
  );
  useHotkeys(
    'f+l',
    () => {
      window.open('https://linkedin.com/in/snowyedotdev', '_blank');
    },
    { preventDefault: true }
  );
  useHotkeys(
    'f+i',
    () => {
      window.open('https://www.instagram.com/gabtrzimajewski', '_blank');
    },
    { preventDefault: true }
  );

  // Locale shortcuts.
  useHotkeys('l+e', () => switchLocale('en'), { preventDefault: true });
  useHotkeys('l+p', () => switchLocale('pt'), { preventDefault: true });

  const popPage = React.useCallback(() => {
    setPages(pages => {
      const x = [...pages];
      x.splice(-1, 1);
      return x;
    });
  }, []);

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        bounce();
      }

      if (isHome || inputValue.length) {
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        popPage();
        bounce();
      }
    },
    [inputValue.length, isHome, popPage]
  );

  function bounce() {
    if (ref.current) {
      ref.current.style.transform = 'scale(0.96)';
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.transform = '';
        }
      }, 100);

      setInputValue('');
    }
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <AnimatePresence>
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content
              asChild
              forceMount
              aria-describedby={undefined}
            >
              <motion.div
                className="fixed inset-x-0 top-[12vh] z-50 mx-auto w-[min(640px,calc(100vw-2rem))] outline-none"
                initial={
                  reduced
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.96, y: -10, filter: 'blur(6px)' }
                }
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={
                  reduced
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.98, y: -6, filter: 'blur(4px)' }
                }
                transition={{ type: 'spring', bounce: 0.18, duration: 0.35 }}
              >
                <DialogPrimitive.Title className="sr-only">
                  {k.placeholder}
                </DialogPrimitive.Title>
                <CommandRoot
                  ref={ref}
                  loop
                  value={selected}
                  onValueChange={setSelected}
                  onKeyDown={onKeyDown}
                >
                  {pages.length > 1 && (
                    <div className="flex gap-1 px-2 pt-1">
                      {pages.map(p => (
                        <span
                          key={p}
                          className="inline-flex h-5 select-none items-center rounded bg-white/[0.06] px-2 text-[11px] capitalize text-white/60"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                  <CommandInput
                    autoFocus
                    placeholder={k.placeholder}
                    onValueChange={value => {
                      setInputValue(value);
                    }}
                  />
                  <SelectedContext.Provider value={selected}>
                    <CommandList>
                      <CommandEmpty>{k.empty}</CommandEmpty>
                      {activePage === 'home' && (
                        <Home
                          navigate={navigate}
                          switchLocale={switchLocale}
                          currentLocale={currentLocale}
                          onClose={() => setIsOpen(false)}
                        />
                      )}
                    </CommandList>
                  </SelectedContext.Provider>
                  <div className="mt-2 flex items-center gap-4 border-white/[0.06] border-t px-3 pt-2.5 pb-1 text-[11px] text-white/35">
                    <Hint keys={['↑', '↓']}>{k.hints.navigate}</Hint>
                    <Hint keys={['↵']}>{k.hints.select}</Hint>
                    <Hint keys={['esc']}>{k.hints.close}</Hint>
                  </div>
                </CommandRoot>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

function Hint({ keys, children }: { keys: string[]; children: string }) {
  return (
    <span className="flex items-center gap-1.5">
      {keys.map(key => (
        <kbd
          key={key}
          className="flex h-4 min-w-4 items-center justify-center rounded bg-white/[0.06] px-1 font-sans text-[10px] text-white/55"
        >
          {key}
        </kbd>
      ))}
      {children}
    </span>
  );
}

type HomeProps = {
  navigate: (to: string) => void;
  switchLocale: (next: AppLocale) => void;
  currentLocale: AppLocale;
  onClose: () => void;
};

function Home({ navigate, switchLocale, currentLocale, onClose }: HomeProps) {
  const t = useT();
  const k = t.common.kbar;

  const copyLinkRef = useRef<LottieRefCurrentProps>(null);
  const emailRef = useRef<LottieRefCurrentProps>(null);
  const sourceRef = useRef<LottieRefCurrentProps>(null);
  const homeRef = useRef<LottieRefCurrentProps>(null);
  const aboutRef = useRef<LottieRefCurrentProps>(null);
  const projectsRef = useRef<LottieRefCurrentProps>(null);
  const mcpRef = useRef<LottieRefCurrentProps>(null);

  const iconStyle = { width: 20, height: 20 };
  const baseIconProps = {
    style: iconStyle,
    loop: false,
    autoplay: false
  };

  return (
    <>
      <CommandGroup heading={k.sections.goto}>
        <Item
          icon={
            <Lottie
              lottieRef={homeRef}
              animationData={homeIcon}
              {...baseIconProps}
            />
          }
          shortcut="G H"
          onSelect={() => navigate('/')}
        >
          {k.actions.home}
        </Item>
        <Item
          icon={
            <Lottie
              lottieRef={aboutRef}
              animationData={aboutIcon}
              {...baseIconProps}
            />
          }
          shortcut="G A"
          onSelect={() => navigate('/about')}
        >
          {k.actions.about}
        </Item>
        <Item
          icon={
            <Lottie
              lottieRef={projectsRef}
              animationData={projectsIcon}
              {...baseIconProps}
            />
          }
          shortcut="G P"
          onSelect={() => navigate('/projects')}
        >
          {k.actions.projects}
        </Item>
        <Item
          icon={
            <Lottie
              lottieRef={mcpRef}
              animationData={mcpIcon}
              {...baseIconProps}
            />
          }
          shortcut="G M"
          onSelect={() => navigate('/mcp')}
        >
          {k.actions.mcp}
        </Item>
      </CommandGroup>
      <CommandGroup heading={k.sections.general}>
        <Item
          icon={
            <Lottie
              lottieRef={copyLinkRef}
              animationData={copyLinkIcon}
              {...baseIconProps}
            />
          }
          shortcut="U"
          onSelect={() => {
            void navigator.clipboard.writeText(window.location.href);
            onClose();
            toast({
              title: k.toast.title,
              description: k.toast.description
            });
          }}
        >
          {k.actions.copy}
        </Item>
        <Item
          icon={
            <Lottie
              lottieRef={emailRef}
              animationData={emailIcon}
              {...baseIconProps}
            />
          }
          shortcut="E"
          onSelect={() => navigate('/contact')}
        >
          {k.actions.email}
        </Item>
        <Item
          icon={
            <Lottie
              lottieRef={sourceRef}
              animationData={sourceIcon}
              {...baseIconProps}
            />
          }
          shortcut="S"
          onSelect={() => {
            onClose();
            window.open('https://github.com/Sn0wye/snowye.dev', '_blank');
          }}
        >
          {k.actions.source}
        </Item>
      </CommandGroup>
      <CommandGroup heading={k.sections.language}>
        <Item
          icon={<LocaleBadge code="EN" active={currentLocale === 'en'} />}
          shortcut="L E"
          onSelect={() => switchLocale('en')}
        >
          {k.actions.switchToEn}
        </Item>
        <Item
          icon={<LocaleBadge code="PT" active={currentLocale === 'pt'} />}
          shortcut="L P"
          onSelect={() => switchLocale('pt')}
        >
          {k.actions.switchToPt}
        </Item>
      </CommandGroup>
      <CommandGroup heading={k.sections.follow}>
        <Item
          icon={<SocialIcon.Github className="text-white" />}
          shortcut="F G"
          onSelect={() => {
            onClose();
            window.open('https://github.com/Sn0wye/snowye.dev', '_blank');
          }}
        >
          Github
        </Item>
        <Item
          icon={<SocialIcon.Linkedin className="text-white" />}
          shortcut="F L"
          onSelect={() => {
            onClose();
            window.open('https://linkedin.com/in/snowyedotdev', '_blank');
          }}
        >
          LinkedIn
        </Item>
        <Item
          icon={<SocialIcon.Instagram className="text-white" />}
          shortcut="F I"
          onSelect={() => {
            onClose();
            window.open('https://www.instagram.com/gabtrzimajewski', '_blank');
          }}
        >
          Instagram
        </Item>
      </CommandGroup>
    </>
  );
}

function LocaleBadge({ code, active }: { code: string; active: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-5 items-center justify-center rounded text-[9px] font-semibold tracking-wider',
        active ? 'bg-white/15 text-white' : 'bg-white/[0.06] text-white/60'
      )}
    >
      {code}
    </span>
  );
}

function Item({
  children,
  shortcut,
  icon,
  onSelect = () => {}
}: {
  children: string;
  shortcut?: string;
  onSelect?: (value: string) => void;
  icon: ReactElement<LottieComponentProps> | ReactElement;
}) {
  const selected = useContext(SelectedContext) === children;

  // Lottie icons play while their item is highlighted.
  useEffect(() => {
    const lottieRef = (
      icon.props as {
        lottieRef?: { current: { play: () => void; stop: () => void } };
      }
    ).lottieRef;
    if (selected) lottieRef?.current?.play();
    else lottieRef?.current?.stop();
  }, [selected, icon]);

  return (
    <CommandItem value={children} onSelect={onSelect}>
      {selected && (
        <motion.span
          layoutId="command-palette-highlight"
          className="absolute inset-0 -z-10 rounded-lg bg-white/[0.07]"
          transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
        />
      )}
      <span className="flex size-5 items-center justify-center opacity-60 transition-opacity group-data-[selected=true]:opacity-100">
        {icon}
      </span>
      {children}
      {shortcut && (
        <span className="ml-auto flex gap-1">
          {shortcut.split(' ').map(key => (
            <kbd
              key={key}
              className="flex h-5 min-w-5 items-center justify-center rounded bg-white/[0.06] px-1 font-sans text-[11px] text-white/40 transition-colors group-data-[selected=true]:text-white/70"
            >
              {key}
            </kbd>
          ))}
        </span>
      )}
    </CommandItem>
  );
}
