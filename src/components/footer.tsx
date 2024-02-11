import Link from 'next/link';
import { cva } from 'cva';
import { type LucideProps } from 'lucide-react';
import { SocialIcon } from './social-icons';

interface Link {
  title: string;
  url: string;
  Icon: (props: LucideProps) => JSX.Element;
  variant?: Variant;
}

type Variant = 'instagram' | 'github' | 'linkedin';

const links: Link[] = [
  {
    title: 'Email',
    url: '/contact',
    Icon: SocialIcon.Mail
  },
  {
    title: 'GitHub',
    url: 'https://github.com/Sn0wye',
    Icon: SocialIcon.Github,
    variant: 'github'
  },
  {
    title: 'LinkedIn',
    url: 'https://linkedin.com/in/snowyedotdev',
    Icon: SocialIcon.Linkedin,
    variant: 'linkedin'
  },
  {
    title: 'Instagram',
    url: 'https://instagram.com/gabtrzimajewski',
    Icon: SocialIcon.Instagram,
    variant: 'instagram'
  }
];

export function Footer() {
  return (
    <footer className="flex items-center justify-center bg-transparent py-5">
      {links.map((link, index) => (
        <LinkComponent key={index} link={link} index={index} />
      ))}
    </footer>
  );
}

const linkVariants = cva({
  base: 'group mb-1 ml-5 flex items-center gap-1 border-0 text-secondary transition-colors duration-200 ease-in-out hover:opacity-100 focus:text-primary focus:opacity-100',
  variants: {
    variant: {
      default: 'hover:text-primary',
      linkedin: 'hover:text-linkedin',
      github: 'hover:text-primary',
      instagram: 'hover:text-instagram'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});

const iconVariants = cva({
  base: 'h-4 w-4 -mt-1 font-bold opacity-100 transition-opacity duration-200 ease-in-out hover:opacity-100 group-hover:opacity-100 md:opacity-0',
  variants: {
    variant: {
      default: 'fill-primary',
      linkedin: 'fill-linkedin',
      github: 'fill-primary',
      instagram: 'fill-instagram'
    }
  }
});

const LinkComponent = ({ link, index }: { link: Link; index: number }) => {
  const target = link.url.startsWith('http') ? '_blank' : '_self';

  return (
    <Link
      key={index}
      href={link.url}
      target={target}
      className={linkVariants({ variant: link.variant })}
    >
      <span className="hidden md:block">{link.title}</span>
      <link.Icon className={iconVariants({ variant: link.variant })} />
    </Link>
  );
};
