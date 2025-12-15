'use client';

import { Command } from 'cmdk';
import Lottie, {
  type LottieComponentProps,
  type LottieRefCurrentProps
} from 'lottie-react';
import { useRouter } from 'next/navigation';
import React, { type ReactElement, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { create } from 'zustand';
import aboutIcon from '../../public/static/icons/about.json';
import copyLinkIcon from '../../public/static/icons/copy-link.json';
import emailIcon from '../../public/static/icons/email.json';
import homeIcon from '../../public/static/icons/home.json';
import projectsIcon from '../../public/static/icons/projects.json';
import sourceIcon from '../../public/static/icons/source.json';
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

  const [pages, setPages] = React.useState<string[]>(['home']);
  const activePage = pages[pages.length - 1];
  const isHome = activePage === 'home';

  const { push } = useRouter();
  const navigate = (to: string) => {
    if (window.location.pathname === to) {
      return;
    }

    push(to);
    setIsOpen(false);
  };

  useHotkeys('mod+k', () => toggle());

  // shortcut listeners
  useHotkeys('g+h', () => navigate('/'), {
    preventDefault: true
  });
  useHotkeys('g+a', () => navigate('/about'), {
    preventDefault: true
  });
  useHotkeys('g+p', () => navigate('/projects'), {
    preventDefault: true
  });
  useHotkeys(
    'u',
    async () => {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Copied :D',
        description: 'You can now share it with anyone.'
      });
    },
    {
      preventDefault: true
    }
  );
  useHotkeys('e', () => navigate('/contact'), {
    preventDefault: true
  });
  useHotkeys(
    's',
    () => {
      window.open('https://github.com/Sn0wye/snowye.dev', '_blank');
    },
    {
      preventDefault: true
    }
  );
  useHotkeys(
    'f+g',
    () => {
      window.open('https://github.com/Sn0wye/snowye.dev', '_blank');
    },
    {
      preventDefault: true
    }
  );
  useHotkeys(
    'f+l',
    () => {
      window.open('https://linkedin.com/in/snowyedotdev', '_blank');
    },
    {
      preventDefault: true
    }
  );
  useHotkeys(
    'f+i',
    () => {
      window.open('https://www.instagram.com/gabtrzimajewski', '_blank');
    },
    {
      preventDefault: true
    }
  );

  const popPage = React.useCallback(() => {
    setPages(pages => {
      const x = [...pages];
      x.splice(-1, 1);
      return x;
    });
  }, []);

  // command bar listeners
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
            placeholder="What do you need?"
            onValueChange={value => {
              setInputValue(value);
            }}
          />
          <Command.List>
            <CommandEmpty>No results found.</CommandEmpty>
            {activePage === 'home' && <Home />}
          </Command.List>
        </CommandRoot>
      </DialogContent>
    </Dialog>
  );
}

function Home() {
  const copyLinkRef = useRef<LottieRefCurrentProps>(null);
  const emailRef = useRef<LottieRefCurrentProps>(null);
  const sourceRef = useRef<LottieRefCurrentProps>(null);
  const homeRef = useRef<LottieRefCurrentProps>(null);
  const aboutRef = useRef<LottieRefCurrentProps>(null);
  const projectsRef = useRef<LottieRefCurrentProps>(null);

  const { setIsOpen } = useCommandPalette();
  const { push } = useRouter();

  const navigate = (to: string) => {
    if (window.location.pathname === to) {
      return;
    }

    push(to);
    setIsOpen(false);
  };

  const iconStyle = { width: 24, height: 24 };
  const baseIconProps = {
    style: iconStyle,
    loop: false,
    autoplay: false
  };

  return (
    <>
      <CommandGroup heading="Go To">
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
          {/* <HomeIcon /> */}
          Home
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
          About
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
          Projects
        </Item>
      </CommandGroup>
      <CommandGroup heading="General">
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
            setIsOpen(false);
            toast({
              title: 'Copied :D',
              description: 'You can now share it with anyone.'
            });
          }}
        >
          Copy URL
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
          Send Email
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
            setIsOpen(false);
            window.open('https://github.com/Sn0wye/snowye.dev', '_blank');
          }}
        >
          View Source
        </Item>
      </CommandGroup>
      <CommandGroup heading="Follow">
        <Item
          icon={<SocialIcon.Github className="text-white" />}
          shortcut="F G"
          onSelect={() => {
            setIsOpen(false);
            window.open('https://github.com/Sn0wye/snowye.dev', '_blank');
          }}
        >
          Github
        </Item>
        <Item
          icon={<SocialIcon.Linkedin className="text-white" />}
          shortcut="F L"
          onSelect={() => {
            setIsOpen(false);
            window.open('https://linkedin.com/in/snowyedotdev', '_blank');
          }}
        >
          LinkedIn
        </Item>
        <Item
          icon={<SocialIcon.Instagram className="text-white" />}
          shortcut="F I"
          onSelect={() => {
            setIsOpen(false);
            window.open('https://www.instagram.com/gabtrzimajewski', '_blank');
          }}
        >
          Instagram
        </Item>
      </CommandGroup>
    </>
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

    // Create a new MutationObserver
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

    // Start observing the 'data-selected' attribute on the element
    observer.observe(itemRef.current, { attributes: true });

    // Clean up the observer when the component unmounts
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selected) {
      icon.props.lottieRef?.current?.play();
    } else {
      icon.props.lottieRef?.current?.stop();
    }
  }, [icon.props.lottieRef, selected]);

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
