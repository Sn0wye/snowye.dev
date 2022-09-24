import { motion } from 'framer-motion';
import { styled } from '../../../stitches.config';

export const Hover = styled(motion.span, {
  position: 'absolute',
  inset: 0,
  background: '$hover',
  borderRadius: '$borderRadius',
  zIndex: -1,
});

export const Project = styled(motion.a, {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  transition: 'opacity $duration ease-in-out',
  border: '0',
  borderRadius: '$borderRadius',
  textDecoration: 'none',
  width: 'auto',
  padding: '1.25rem',
  '&:hover': { opacity: 1 },
  '@bp2': { width: 180, maxWidth: '8.75rem', },
  '& svg': {
    size: '1.5rem',
    margin: '0 auto 0.75rem 0',
  },
});

export const Body = styled('div', {
  flex: '1 1 auto',
});

export const Title = styled('p', {
  color: '$primary',
  margin: '0',
  fontSize: '18px',
});

export const Description = styled('p', {
  margin: '0',
  color: '$secondary',
  lineHeight: '24px',
});

export const Stats = styled('p', {
  margin: '5px 0 0',
  color: '$primary',
  textTransform: 'uppercase',
  display: 'inline-block',
  fontWeight: 500,
  letterSpacing: '1.2px',
  fontSize: '12px',
});
