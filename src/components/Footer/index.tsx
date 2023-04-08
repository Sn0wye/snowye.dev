import type Link from 'next/link';
import { BsGithub, BsLinkedin } from 'react-icons/bs';
import { FaInstagram } from 'react-icons/fa';
import { RiMailLine } from 'react-icons/ri';
import { Anchor, Container, Title } from './styles';

interface Link {
  title: string;
  url: string;
  icon: JSX.Element;
  variant: Variants;
}

type Variants = 'instagram' | 'email' | 'github' | 'linkedin';

const links: Link[] = [
  {
    title: 'Email',
    url: '/contact',
    icon: <RiMailLine />,
    variant: 'email'
  },
  {
    title: 'GitHub',
    url: 'https://github.com/Sn0wye',
    icon: <BsGithub />,
    variant: 'github'
  },
  {
    title: 'LinkedIn',
    url: 'https://linkedin.com/in/snowyedotdev',
    icon: <BsLinkedin />,
    variant: 'linkedin'
  },
  {
    title: 'Instagram',
    url: 'https://instagram.com/gabtrzimajewski',
    icon: <FaInstagram />,
    variant: 'instagram'
  }
];

export function Footer() {
  return (
    <Container>
      {links.map((link, index) => (
        <LinkComponent key={index} link={link} index={index} />
      ))}
    </Container>
  );
}

const LinkComponent = ({ link, index }: { link: Link; index: number }) => {
  const target = link.url.startsWith('http') ? '_blank' : '_self';

  return (
    <Anchor type={link.variant} key={index} href={link.url} target={target}>
      <Title>{link.title}</Title>
      {link.icon}
    </Anchor>
  );
};
