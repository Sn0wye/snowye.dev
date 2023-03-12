import { motion } from 'framer-motion';
import Link from 'next/link';
import { RiCommandLine } from 'react-icons/ri';
import { styled } from '../../../stitches.config';

export const Header = styled('header', {
  display: 'flex',
  alignItems: 'center',
  color: 'white',
  fontSize: '0.75rem',
  minHeight: '3.75rem',
  width: '100%',
  flexWrap: 'wrap',
  position: 'absolute',
  top: '0',
  zIndex: 3,
  marginTop: '0.75rem',
  '@bp2': { marginTop: '0' }
});

export const List = styled('ul', {
  margin: '0',
  padding: '0',
  listStyle: 'none',
  display: 'inline-flex',
  position: 'relative',
  top: '0.3125rem',
  '@bp1': { justifyContent: 'space-around' }
});

export const CmdButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  borderRadius: '$borderRadius',
  cursor: 'pointer',
  padding: '0.35rem',
  transition: 'background $duration ease-in-out',
  '&:hover': { background: '$hover' }
});

export const CmdIcon = styled(RiCommandLine, {
  width: '1.5rem',
  height: '1.5rem'
});

export const LogoButton = styled(Link, {
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  borderRadius: '$borderRadius',
  color: 'white',
  cursor: 'pointer',
  padding: '0.25rem 0.625rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background $duration ease-in-out',
  '&:hover': { background: '$hover' },
  fontWeight: 700,
  textDecoration: 'none',
  marginLeft: '0.75rem',
  fontFamily: '$heading'
});

export const Nav = styled('nav', {
  textAlign: 'center',
  flex: 1,
  order: 2,
  flexBasis: '100%',
  '@bp2': { order: 0, flexBasis: 'initial' },
  '@bp3': { overflowX: 'scroll', overflowY: 'hidden' }
});

export const Aside = styled('div', {
  display: 'flex',
  alignItems: 'center',
  paddingRight: '0.75rem',
  marginLeft: 'auto'
});

export const Anchor = styled(Link, {
  border: 0,
  position: 'relative',
  '&:hover, &:focus': { opacity: 1 }
});

export const NavContainer = styled(motion.span, {
  color: '$secondary',
  cursor: 'pointer',
  display: 'inline-block',
  fontSize: '0.75rem',
  fontWeight: 500,
  letterSpacing: '1.2px',
  padding: '1.25rem',
  textDecoration: 'none',
  textTransform: 'uppercase',
  transition: 'color $duration ease-in-out',
  '&:hover': {
    color: '$primary'
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    margin: '0 auto',
    top: '1.125rem',
    left: 0,
    right: 0,
    height: '1px',
    width: '1.25rem',
    background: 'rgb(255, 255, 255)',
    opacity: 0,
    transition: 'opacity $duration ease-in-out'
  }
});

export const Hover = styled(motion.span, {
  position: 'absolute',
  top: '-0.9375rem',
  left: '0',
  right: '0',
  background: '$hover',
  padding: 20,
  borderRadius: '$borderRadius',
  zIndex: -1
});
