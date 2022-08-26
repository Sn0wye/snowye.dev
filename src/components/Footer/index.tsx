import Link from 'next/link';
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
    variant: 'email',
  },
  {
    title: 'GitHub',
    url: 'https://github.com/Sn0wye',
    icon: <BsGithub />,
    variant: 'github',
  },
  {
    title: 'LinkedIn',
    url: 'https://linkedin.com/in/gabriel-trzimajewski',
    icon: <BsLinkedin />,
    variant: 'linkedin',
  },
  {
    title: 'Instagram',
    url: 'https://instagram.com/gabtrzimajewski',
    icon: <FaInstagram />,
    variant: 'instagram',
  },
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
  if (link.url.startsWith('http')) {
    return (
      <Anchor key={index} href={link.url} target='_blank' type={link.variant}>
        <Title>{link.title}</Title>
        {link.icon}
      </Anchor>
    );
  }

  return (
    <Link key={index} href={link.url} passHref>
      <Anchor type={link.variant}>
        <Title>{link.title}</Title>
        {link.icon}
      </Anchor>
    </Link>
  );
};
