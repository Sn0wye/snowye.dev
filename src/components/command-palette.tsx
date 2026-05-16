'use client';

import { Command } from 'cmdk';
import { useParams } from 'next/navigation';
import React, {
  type ReactElement,
  useEffect,
  useRef,
  useState,
  useTransition
} from 'react';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import type { LottieComponentProps, LottieRefCurrentProps } from 'lottie-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { create } from 'zustand';
import aboutIcon from '../../public/static/icons/about.json';
import copyLinkIcon from '../../public/static/icons/copy-link.json';
import emailIcon from '../../public/static/icons/email.json';
import homeIcon from '../../public/static/icons/home.json';
import projectsIcon from '../../public/static/icons/projects.json';
import sourceIcon from '../../public/static/icons/source.json';
import { usePathname, useRouter } from '@/i18n/navigation';
import { type AppLocale } from '@/i18n/routing';
import { useAppLocale, useT } from '@/i18n/use-t';
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  Command as CommandRoot
} from './command';
import { Dialog, DialogContent } from './dialog';
import { SocialIcon } from './social-icons';
import { toast } from './use-toast';

type CommandPaletteState = {
  isOpen: boolean;
  toggle: () => void;
  setIsOpen: (isOpen: boolean) => void;
};

export const useCommandPalette = create<CommandPaletteState>(set => ({
  isOpen: false,
  setIsOpen: isOpen => set({ isOpen }),
  toggle: () => set(state => ({ isOpen: !state.isOpen }))
}));

export function CommandPalette() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [inputValue, setInputValue] = React.useState('');
  const { isOpen, setIsOpen, toggle } = useCommandPalette();
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        hideClose
        className="max-w-[640px] overflow-hidden border-0 p-0"
      >
        <CommandRoot ref={ref} onKeyDown={onKeyDown}>
          <div>
            {pages.map(p => (
              <div
                key={p}
                className="my-1 ml-1 inline-flex h-5 select-none items-center rounded bg-white/5 px-2 text-xs font-medium capitalize text-zinc-50"
              >
                {p}
              </div>
            ))}
          </div>
          <CommandInput
            autoFocus
            placeholder={k.placeholder}
            onValueChange={value => {
              setInputValue(value);
            }}
          />
          <Command.List>
            <CommandEmpty>{k.empty}</CommandEmpty>
            {activePage === 'home' && (
              <Home
                navigate={navigate}
                switchLocale={switchLocale}
                currentLocale={currentLocale}
                onClose={() => setIsOpen(false)}
              />
            )}
          </Command.List>
        </CommandRoot>
      </DialogContent>
    </Dialog>
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

  const iconStyle = { width: 24, height: 24 };
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
    <div
      aria-hidden
      className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold uppercase tracking-wider ${
        active ? 'bg-primary/20 text-primary' : 'bg-white/5 text-zinc-300'
      }`}
    >
      {code}
    </div>
  );
}

function Item({
  children,
  shortcut,
  icon,
  onSelect = () => {}
}: {
  children: React.ReactNode;
  shortcut?: string;
  onSelect?: (value: string) => void;
  icon: ReactElement<LottieComponentProps> | ReactElement;
}) {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<boolean>(false);

  useEffect(() => {
    if (!itemRef?.current) return;

    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-selected'
        ) {
          const newValue =
            itemRef.current?.getAttribute('data-selected') === 'true';
          setSelected(newValue);
        }
      }
    });

    observer.observe(itemRef.current, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const lottieRef = (icon.props as { lottieRef?: { current: { play: () => void; stop: () => void } } }).lottieRef;
    if (selected) {
      lottieRef?.current?.play();
    } else {
      lottieRef?.current?.stop();
    }
  }, [selected]);

  return (
    <CommandItem onSelect={onSelect} ref={itemRef}>
      {icon && icon}
      {children}
      {shortcut && (
        <div className="ml-auto flex gap-2">
          {typeof shortcut === 'string'
            ? shortcut.split(' ').map(key => {
                return (
                  <kbd
                    key={key}
                    className="inline-flex h-[20px] w-[20px] items-center justify-center rounded bg-zinc-700/80 px-2 py-0 text-center text-xs leading-8 text-zinc-400"
                  >
                    <span>{key}</span>
                  </kbd>
                );
              })
            : shortcut}
        </div>
      )}
    </CommandItem>
  );
}
